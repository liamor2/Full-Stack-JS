/**
 * Unwraps common Zod wrapper types to reveal the innermost schema, and
 * collects metadata about optionality and default values.
 *
 * The function iteratively inspects the `_def.typeName` of the provided
 * schema-like object and peels off wrapper layers such as:
 * - ZodOptional
 * - ZodNullable
 * - ZodDefault
 * - ZodEffects
 *
 * For each relevant wrapper:
 * - ZodOptional and ZodNullable set `optional = true` and continue unwrapping.
 * - ZodDefault sets `optional = true`, attempts to read a default value by
 *   invoking `def.defaultValue()` (capturing any thrown errors), and continues
 *   unwrapping.
 * - ZodEffects replaces the current schema with `def.schema` and continues.
 *
 * The loop terminates when no `_def.typeName` is present or when an unknown
 * wrapper type is encountered. The original input object is not modified; only
 * a local reference is reassigned while unwrapping.
 *
 * @param schema - A Zod schema or wrapper object (any). Expected to have a
 *   `_def` property with a `typeName` string and wrapper-specific fields like
 *   `innerType`, `schema`, or `defaultValue`.
 * @returns An object with:
 *   - `schema`: the innermost unwrapped schema (any),
 *   - `optional`: boolean indicating whether any encountered wrapper
 *     represents optional/nullable/default behavior,
 *   - `defaultValue`: the extracted default value if a ZodDefault wrapper was
 *     found and its `defaultValue()` could be invoked successfully; otherwise
 *     `undefined`.
 *
 * @remarks
 * - Nullable wrappers are treated as "optional" by this helper.
 * - The function is intentionally permissive in typing (uses `any`) because
 *   it operates on Zod internals and wrapper shapes rather than public types.
 * - If `def.defaultValue()` throws or is unavailable, `defaultValue` will be
 *   `undefined`.
 */
function unwrap(schema: any) {
  let optional = false;
  let defaultValue: any = undefined;
  while (true) {
    const def = schema?._def;
    const t = def?.typeName;
    if (!t) break;
    if (t === "ZodOptional" || t === "ZodNullable") {
      optional = true;
      schema = def.innerType ?? def.schema ?? schema;
      continue;
    }
    if (t === "ZodDefault") {
      optional = true;
      try {
        defaultValue = def.defaultValue();
      } catch {
        defaultValue = undefined;
      }
      schema = def.innerType ?? def.schema ?? schema;
      continue;
    }
    if (t === "ZodEffects") {
      schema = def.schema ?? schema;
      continue;
    }
    break;
  }
  return { schema, optional, defaultValue };
}

/**
 * Convert a Zod schema (or a wrapped Zod schema) into a plain Mongoose schema definition fragment.
 *
 * This function expects an `unwrap` utility to extract the "core" Zod schema plus
 * wrapper metadata (e.g. whether the original schema was optional and any default value).
 * It inspects the underlying Zod type (via `core._def.typeName`) and returns a value
 * suitable for use in a Mongoose schema definition (plain objects, arrays, or type descriptors).
 *
 * Supported Zod types:
 * - ZodString      -> { type: String, required?: true, default?: ... }
 * - ZodNumber      -> { type: Number, required?: true, default?: ... }
 * - ZodBoolean     -> { type: Boolean, required?: true, default?: ... }
 * - ZodEnum        -> { type: String, enum: string[], required?: true, default?: ... }
 * - ZodLiteral     -> { type: String|Number|Boolean|Object, default: literalValue, required?: false }
 * - ZodArray       -> [ <converted item schema> ]
 * - ZodObject      -> { key: <converted value schema>, ... } (recursively converts the shape)
 * - default/fallback -> { type: Object }
 *
 * Important behavior notes:
 * - The function uses the wrapper info (`optional` and `defaultValue`) to set `required` and `default`
 *   on returned descriptors. Specifically, `required` is set to true when the original schema
 *   was not optional; `default` is set when a default value is present.
 * - For ZodLiteral the literal value is always set as the `default`. If the original schema was optional,
 *   `required` is explicitly set to false; otherwise `required` is omitted (the literal default remains).
 * - Arrays and objects are converted recursively. For arrays the returned value is a single-element array
 *   whose element is the converted item schema.
 * - This function returns plain definitions suitable for passing into `new mongoose.Schema(...)`,
 *   but does not itself construct a Mongoose Schema instance.
 * - Unrecognized or unsupported Zod kinds fall back to { type: Object }.
 *
 * Limitations / Caveats:
 * - Relies on the shape of Zod internals (e.g. `_def.typeName` and `_def.*`), which may change between Zod versions.
 * - Does not attempt to convert advanced Zod constructs (e.g. unions, intersections, refinements, discriminated unions)
 *   beyond the listed supported kinds; such cases will fall back to a generic object mapping.
 *
 * @param schema - A Zod schema value (possibly wrapped with optional/default). The function expects `unwrap(schema)`
 *                 to return an object of the form `{ schema: coreZodSchema, optional: boolean, defaultValue?: any }`.
 * @returns A Mongoose-style schema definition fragment (type descriptors, nested objects, or arrays) that can be
 *          used inside a Mongoose schema definition.
 *
 * @example
 * // Given a Zod schema like:
 * //   const z = zod.object({ name: zod.string(), tags: zod.array(zod.string().optional()) });
 * // The converted fragment might look like:
 * //   { name: { type: String, required: true }, tags: [{ type: String }] }
 */
export function zodToMongoose(schema: any): any {
  const { schema: core, optional, defaultValue } = unwrap(schema);
  const kind = core?._def?.typeName;

  const required = !optional;
  const withReqAndDefault = (def: any) => {
    if (defaultValue !== undefined) def.default = defaultValue;
    if (required) def.required = true;
    return def;
  };

  switch (kind) {
    case "ZodString":
      return withReqAndDefault({ type: String });
    case "ZodNumber":
      return withReqAndDefault({ type: Number });
    case "ZodBoolean":
      return withReqAndDefault({ type: Boolean });
    case "ZodEnum": {
      const values = core._def.values as string[];
      return withReqAndDefault({ type: String, enum: values });
    }
    case "ZodLiteral": {
      const val = core._def.value;
      const t = typeof val;
      const map: any = { string: String, number: Number, boolean: Boolean };
      const type = map[t] ?? Object;
      const def: any = { type };
      if (!required) def.required = false;
      def.default = val;
      return def;
    }
    case "ZodArray": {
      const item = core._def.type;
      return [zodToMongoose(item)];
    }
    case "ZodObject": {
      const shapeDef = core._def.shape;
      const shape = typeof shapeDef === "function" ? shapeDef() : shapeDef;
      const objDef: Record<string, any> = {};
      for (const key of Object.keys(shape)) {
        objDef[key] = zodToMongoose(shape[key]);
      }
      return objDef;
    }
    default:
      return { type: Object };
  }
}

export default zodToMongoose;

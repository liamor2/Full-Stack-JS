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

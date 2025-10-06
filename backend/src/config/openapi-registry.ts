/**
 * Simple in-memory OpenAPI registry used to programmatically register
 * paths and component schemas from code (e.g. generic routers).
 *
 * The registry exposes registerPath/registerSchema functions and a
 * getOpenApiExtras() helper which returns { paths, components } to be
 * merged into the swagger-jsdoc-generated spec.
 */
type OpenApiPathItem = Record<string, unknown>;

const paths: Record<string, OpenApiPathItem> = {};
const components: Record<string, Record<string, unknown>> = {
  schemas: {},
};

export function registerPath(path: string, item: OpenApiPathItem) {
  paths[path] = { ...(paths[path] || {}), ...item } as OpenApiPathItem;
}

export function registerSchema(name: string, schema: Record<string, unknown>) {
  if (!components.schemas[name]) {
    components.schemas[name] = schema;
  }
}

export function registerCrudResource(basePath: string, options: { tag?: string; schemas?: Record<string, unknown> } = {}) {
  const tag = options.tag || basePath.replace(/^\//, "");

  registerPath(basePath, {
    get: {
      tags: [tag],
      summary: `List ${tag}`,
      responses: { "200": { description: "OK" } },
    },
    post: {
      tags: [tag],
      summary: `Create ${tag}`,
      responses: { "201": { description: "Created" } },
    },
  });

  registerPath(`${basePath}/{id}`, {
    get: {
      tags: [tag],
      summary: `Get ${tag} by id`,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { "200": { description: "OK" }, "404": { description: "Not Found" } },
    },
    put: {
      tags: [tag],
      summary: `Update ${tag} by id`,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { "200": { description: "Updated" }, "404": { description: "Not Found" } },
    },
    delete: {
      tags: [tag],
      summary: `Delete ${tag} by id`,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { "200": { description: "Deleted" }, "404": { description: "Not Found" } },
    },
  });

  if (options.schemas) {
    for (const [k, v] of Object.entries(options.schemas)) {
      registerSchema(k, v as Record<string, unknown>);
    }
  }
}

/**
 * Converts a Zod schema instance into an equivalent OpenAPI-compatible schema object.
 *
 * This function recursively traverses the provided Zod schema and generates a JSON schema
 * representation suitable for OpenAPI documentation. It supports common Zod types such as
 * strings, numbers, booleans, enums, literals, arrays, objects, optionals, and nullables.
 *
 * @param z - The Zod schema instance to convert.
 * @returns A plain object representing the OpenAPI schema for the given Zod schema.
 *
 * @remarks
 * - If the schema is not recognized or is undefined, the function defaults to returning a generic object schema.
 * - For ZodObject, required properties are determined by the absence of ZodOptional wrappers.
 * - For ZodEnum and ZodLiteral, the function generates appropriate `enum` fields.
 */
function zodToOpenApi(z: any): Record<string, unknown> {
  if (!z || !z._def) return { type: "object" };
  const t = z._def.typeName;

  switch (t) {
    case "ZodString": {
      if (Array.isArray(z._def.values)) return { type: "string", enum: z._def.values };
      return { type: "string" };
    }
    case "ZodNumber":
      return { type: "number" };
    case "ZodBoolean":
      return { type: "boolean" };
    case "ZodEnum":
      return { type: "string", enum: (z._def && z._def.values) || [] };
    case "ZodLiteral":
      return { enum: [(z._def && z._def.value)] };
    case "ZodArray":
      return { type: "array", items: zodToOpenApi(z._def.type) };
    case "ZodObject": {
      const shape = typeof z._def.shape === "function" ? z._def.shape() : z._def.shape || {};
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [k, v] of Object.entries(shape)) {
        properties[k] = zodToOpenApi(v as any);
        const def = (v as any)._def;
        if (!(def && def.typeName && def.typeName.startsWith("ZodOptional"))) {
          required.push(k);
        }
      }
      const out: Record<string, unknown> = { type: "object", properties };
      if (required.length) out.required = required;
      return out;
    }
    case "ZodOptional":
    case "ZodNullable":
      return zodToOpenApi(z._def.innerType || z._def.type || z._def.schema);
    default:
      return { type: "object" };
  }
}

export function registerZodSchema(name: string, zodSchema: unknown) {
  try {
    const schema = zodToOpenApi(zodSchema);
    registerSchema(name, schema);
  } catch {
    registerSchema(name, { type: "object" });
  }
}

export function getOpenApiExtras() {
  return { paths, components };
}

export default {
  registerPath,
  registerSchema,
  registerCrudResource,
  registerZodSchema,
  getOpenApiExtras,
};

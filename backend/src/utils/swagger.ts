import { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export function createSwagger(app: Express, port: number) {
  const host = process.env.BACKEND_HOST || "https://lit-contact-api.liam-gattegno.fr";

  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Full Stack JS API",
        version: "1.0.0",
        description: "API documentation for Full Stack JS project",
      },
      tags: [
        { name: "Auth", description: "Authentication and user endpoints" },
        { name: "Contacts", description: "Contact CRUD and search endpoints" },
        { name: "Misc", description: "Miscellaneous utility endpoints" },
      ],
      servers: [
        {
          url: `http://${host}:${port}`,
        },
      ],
    },
    apis: ["./src/routes/*.ts"],
  } as const;

  const swaggerSpec = swaggerJsdoc(swaggerOptions as any);

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/docs.json", (req, res) => res.json(swaggerSpec));

  return swaggerSpec;
}

export default createSwagger;

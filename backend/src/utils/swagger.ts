import swaggerJsdoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";

export function createSwagger(app: Express, port: number) {
  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Full Stack JS API",
        version: "1.0.0",
        description: "API documentation for Full Stack JS project",
      },
      servers: [
        {
          url: `http://localhost:${port}`,
        },
      ],
    },
    apis: ["./src/routes/*.ts"],
  } as const;

  const swaggerSpec = swaggerJsdoc(swaggerOptions as any);

  // attach UI and JSON
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/docs.json", (req, res) => res.json(swaggerSpec));

  return swaggerSpec;
}

export default createSwagger;

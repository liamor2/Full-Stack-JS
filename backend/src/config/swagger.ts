import { Router } from "express";
// @ts-expect-error missing types for swagger-jsdoc until @types installed (runtime ok)
import swaggerJSDoc from "swagger-jsdoc";
// @ts-expect-error missing types for swagger-ui-express until @types installed (runtime ok)
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Full Stack JS API",
    version: "1.0.0",
    description: "API documentation for the backend service.",
  },
  servers: [{ url: "http://localhost:3000", description: "Local dev" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: ["src/modules/**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(router: Router) {
  router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  router.get("/docs.json", (_req, res) => {
    res.json(swaggerSpec);
  });
}

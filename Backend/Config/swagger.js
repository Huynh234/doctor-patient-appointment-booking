// Backend/Config/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Doctor-Patient Appointment API",
      version: "1.0.0",
      description: "API documentation for Doctor-Patient Appointment Booking System",
    },
    servers: [
      {
        url: "http://localhost:8080", // sửa theo port backend của bạn
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./Controllers/*.js", "./Routes/*.js"], // nơi bạn mô tả API bằng JSDoc
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📄 Swagger Docs available at http://localhost:8080/api-docs");
}

module.exports = swaggerDocs;

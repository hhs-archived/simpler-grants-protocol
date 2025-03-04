import { OpenAPIV3 } from "openapi-types";
import { DefaultValidationService } from "../../../services/validation/service";
import SwaggerParser from "@apidevtools/swagger-parser";
import { compileTypeSpec } from "../../../utils/typespec";

// Mock dependencies
jest.mock("@apidevtools/swagger-parser", () => ({
  dereference: jest.fn(),
}));

jest.mock("../../../utils/typespec", () => ({
  compileTypeSpec: jest.fn(),
}));

describe("ValidationService", () => {
  let service: DefaultValidationService;
  const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    service = new DefaultValidationService();
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe("checkApi", () => {
    // ############################################################
    // API validation
    // ############################################################

    it("should validate API implementation with options", async () => {
      // Arrange
      const apiUrl = "http://api.example.com";
      const specPath = "spec.yaml";
      const options = {
        client: "httpx",
        report: "json" as const,
        auth: "token123",
      };

      // Act
      await service.checkApi(apiUrl, specPath, options);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith("Mock: Checking API", {
        apiUrl,
        specPath,
        options,
      });
    });

    it("should validate API implementation without options", async () => {
      // Arrange
      const apiUrl = "http://api.example.com";
      const specPath = "spec.yaml";

      // Act
      await service.checkApi(apiUrl, specPath, {});

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith("Mock: Checking API", {
        apiUrl,
        specPath,
        options: {},
      });
    });

    // Note: More tests will be needed once the actual implementation is added:
    // - Test API reachability
    // - Test spec parsing
    // - Test route validation
    // - Test response validation
    // - Test error handling
  });

  describe("checkSpec", () => {
    // ############################################################
    // Base spec validation - using TypeSpec
    // ############################################################

    it("should use TypeSpec-generated spec when no base spec provided", async () => {
      // Arrange
      const typeSpecPath = "/path/to/generated/openapi.yaml";
      const baseDoc: OpenAPIV3.Document = {
        openapi: "3.0.0",
        info: { title: "Base", version: "1.0.0" },
        paths: {
          "/opportunities": {
            get: {
              tags: ["required"],
              responses: {
                "200": { description: "OK" },
              },
            },
          },
        },
      };

      const implDoc: OpenAPIV3.Document = {
        openapi: "3.0.0",
        info: { title: "Implementation", version: "1.0.0" },
        paths: {},
      };

      (compileTypeSpec as jest.Mock).mockReturnValue(typeSpecPath);
      (SwaggerParser.dereference as jest.Mock)
        .mockResolvedValueOnce(implDoc) // First call for impl spec
        .mockResolvedValueOnce(baseDoc); // Second call for TypeSpec-generated base spec

      // Act & Assert
      await expect(service.checkSpec("spec.yaml", {})).rejects.toThrow(/Missing required path/);
      expect(compileTypeSpec).toHaveBeenCalled();
      expect(SwaggerParser.dereference).toHaveBeenCalledWith(typeSpecPath);
    });

    it("should use provided base spec even when TypeSpec is available", async () => {
      // Arrange
      const providedBasePath = "base.yaml";
      const baseDoc: OpenAPIV3.Document = {
        openapi: "3.0.0",
        info: { title: "Base", version: "1.0.0" },
        paths: {},
      };

      const implDoc = { ...baseDoc, info: { title: "Impl", version: "1.0.0" } };

      (SwaggerParser.dereference as jest.Mock)
        .mockResolvedValueOnce(implDoc)
        .mockResolvedValueOnce(baseDoc);

      // Act
      await service.checkSpec("spec.yaml", { base: providedBasePath });

      // Assert - Don't compile TypeSpec if base spec provided
      expect(compileTypeSpec).not.toHaveBeenCalled();
      expect(SwaggerParser.dereference).toHaveBeenCalledWith(providedBasePath);
      expect(mockConsoleLog).toHaveBeenCalledWith("Spec is valid and compliant with base spec");
    });

    // ############################################################
    // Validation failures
    // ############################################################

    it("should throw error when validation fails", async () => {
      // Arrange - Create base spec with required route
      const baseDoc: OpenAPIV3.Document = {
        openapi: "3.0.0",
        info: { title: "Base", version: "1.0.0" },
        paths: {
          "/required": {
            get: {
              tags: ["required"],
              responses: {
                "200": { description: "OK" },
              },
            },
          },
        },
      };

      // Arrange - Create impl spec missing the required route
      const implDoc: OpenAPIV3.Document = {
        openapi: "3.0.0",
        info: { title: "Implementation", version: "1.0.0" },
        paths: {},
      };

      (SwaggerParser.dereference as jest.Mock)
        .mockResolvedValueOnce(implDoc) // First call for impl spec
        .mockResolvedValueOnce(baseDoc); // Second call for base spec

      // Act & Assert
      await expect(service.checkSpec("spec.yaml", { base: "base.yaml" })).rejects.toThrow(
        /Missing required path/
      );
    });

    // ############################################################
    // Multiple validation errors
    // ############################################################

    it("should collect all validation errors", async () => {
      // Arrange - Create base spec with required route and schema
      const baseDoc: OpenAPIV3.Document = {
        openapi: "3.0.0",
        info: { title: "Base", version: "1.0.0" },
        paths: {
          "/opportunities": {
            get: {
              tags: ["required"],
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        required: ["id"],
                        properties: {
                          id: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      // Arrange - Create impl spec with multiple issues:
      //   - Missing /opportunities => should flag as missing route
      //   - /custom/extra => should flag as extra route
      const implDoc: OpenAPIV3.Document = {
        openapi: "3.0.0",
        info: { title: "Impl", version: "1.0.0" },
        paths: {
          "/common-grants/extra": {
            get: {
              responses: {
                "200": { description: "OK" },
              },
            },
          },
        },
      };

      (SwaggerParser.dereference as jest.Mock)
        .mockResolvedValueOnce(implDoc)
        .mockResolvedValueOnce(baseDoc);

      // Act & Assert
      const error = await service.checkSpec("spec.yaml", { base: "base.yaml" }).catch(e => e);

      expect(error.message).toContain("Missing required path");
      expect(error.message).toContain("Extra route found");
    });

    // ############################################################
    // Successful validation
    // ############################################################

    it("should pass when spec is valid and compliant", async () => {
      // Arrange - Create matching base and impl specs
      const baseDoc: OpenAPIV3.Document = {
        openapi: "3.0.0",
        info: { title: "Base", version: "1.0.0" },
        paths: {
          "/test": {
            get: {
              responses: {
                "200": { description: "OK" },
              },
            },
          },
        },
      };

      const implDoc = { ...baseDoc, info: { title: "Impl", version: "1.0.0" } };

      (SwaggerParser.dereference as jest.Mock)
        .mockResolvedValueOnce(implDoc)
        .mockResolvedValueOnce(baseDoc);

      // Act
      await service.checkSpec("spec.yaml", { base: "base.yaml" });

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith("Spec is valid and compliant with base spec");
    });
  });
});

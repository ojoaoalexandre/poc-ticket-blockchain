import { expect } from "chai";
import {
  validateMetadata,
  validateMetadataJSON,
  isValidMetadata,
  NFTMetadata
} from "../../utils/metadata";

describe("Metadata Validator", function () {
  describe("validateMetadata", function () {
    it("should validate correct metadata", function () {
      const validMetadata: NFTMetadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest123",
        attributes: [
          { trait_type: "Event", value: "Test Event" },
          { trait_type: "Seat", value: "A-1" }
        ]
      };

      const result = validateMetadata(validMetadata);

      expect(result.valid).to.be.true;
      expect(result.errors).to.be.empty;
    });

    it("should reject metadata missing required name field", function () {
      const invalidMetadata = {
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: []
      };

      const result = validateMetadata(invalidMetadata);

      expect(result.valid).to.be.false;
      expect(result.errors).to.include("Field 'name' is required and must be a string");
    });

    it("should reject metadata missing required description field", function () {
      const invalidMetadata = {
        name: "Test NFT",
        image: "ipfs://QmTest",
        attributes: []
      };

      const result = validateMetadata(invalidMetadata);

      expect(result.valid).to.be.false;
      expect(result.errors).to.include("Field 'description' is required and must be a string");
    });

    it("should reject metadata missing required image field", function () {
      const invalidMetadata = {
        name: "Test NFT",
        description: "Test description",
        attributes: []
      };

      const result = validateMetadata(invalidMetadata);

      expect(result.valid).to.be.false;
      expect(result.errors).to.include("Field 'image' is required and must be a string");
    });

    it("should reject metadata missing required attributes field", function () {
      const invalidMetadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest"
      };

      const result = validateMetadata(invalidMetadata);

      expect(result.valid).to.be.false;
      expect(result.errors).to.include("Field 'attributes' is required");
    });

    it("should reject metadata with non-array attributes", function () {
      const invalidMetadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: "not an array"
      };

      const result = validateMetadata(invalidMetadata);

      expect(result.valid).to.be.false;
      expect(result.errors).to.include("Field 'attributes' must be an array");
    });

    it("should warn about empty attributes array", function () {
      const metadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: []
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.true;
      expect(result.warnings).to.include("Attributes array is empty - NFT will have no traits");
    });

    it("should accept valid IPFS image URL", function () {
      const metadata: NFTMetadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest123456",
        attributes: [{ trait_type: "Test", value: "Value" }]
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.true;
      expect(result.errors).to.be.empty;
    });

    it("should accept valid HTTPS image URL", function () {
      const metadata: NFTMetadata = {
        name: "Test NFT",
        description: "Test description",
        image: "https://example.com/image.png",
        attributes: [{ trait_type: "Test", value: "Value" }]
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.true;
      expect(result.errors).to.be.empty;
    });

    it("should warn about HTTP image URL", function () {
      const metadata: NFTMetadata = {
        name: "Test NFT",
        description: "Test description",
        image: "http://example.com/image.png",
        attributes: [{ trait_type: "Test", value: "Value" }]
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.true;
      expect(result.warnings).to.include("Image URL uses HTTP instead of HTTPS - not recommended for production");
    });

    it("should reject invalid image URL protocol", function () {
      const metadata: NFTMetadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ftp://example.com/image.png",
        attributes: [{ trait_type: "Test", value: "Value" }]
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.false;
      expect(result.errors).to.include("Image URL must start with ipfs://, https://, or data:image/");
    });

    it("should warn about IPFS gateway URLs", function () {
      const metadata: NFTMetadata = {
        name: "Test NFT",
        description: "Test description",
        image: "https://ipfs.io/ipfs/QmTest",
        attributes: [{ trait_type: "Test", value: "Value" }]
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.true;
      expect(result.warnings).to.include("Consider using ipfs:// protocol instead of gateway URL for better decentralization");
    });

    it("should validate attributes with correct structure", function () {
      const metadata: NFTMetadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: [
          { trait_type: "String Trait", value: "String Value" },
          { trait_type: "Number Trait", value: 42 },
          { trait_type: "Date Trait", value: 1704067200, display_type: "date" }
        ]
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.true;
      expect(result.errors).to.be.empty;
    });

    it("should reject attribute without trait_type", function () {
      const metadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: [
          { value: "Missing trait_type" }
        ]
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.false;
      expect(result.errors).to.include("Attribute at index 0 must have a 'trait_type' string field");
    });

    it("should reject attribute without value", function () {
      const metadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: [
          { trait_type: "Test" }
        ]
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.false;
      expect(result.errors).to.include("Attribute at index 0 must have a 'value' field");
    });

    it("should reject attribute with invalid value type", function () {
      const metadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: [
          { trait_type: "Test", value: { nested: "object" } }
        ]
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.false;
      expect(result.errors).to.include("Attribute at index 0 has invalid value type (must be string or number)");
    });

    it("should reject invalid display_type", function () {
      const metadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: [
          { trait_type: "Test", value: 42, display_type: "invalid_type" }
        ]
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.false;
      expect(result.errors).to.include("Attribute at index 0 has invalid display_type: invalid_type");
    });

    it("should accept valid display_types", function () {
      const metadata: NFTMetadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: [
          { trait_type: "Number", value: 10, display_type: "number" },
          { trait_type: "Boost", value: 5, display_type: "boost_number" },
          { trait_type: "Percent", value: 75, display_type: "boost_percentage" },
          { trait_type: "Date", value: 1704067200, display_type: "date" }
        ]
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.true;
      expect(result.errors).to.be.empty;
    });

    it("should validate optional fields when present", function () {
      const metadata: NFTMetadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: [{ trait_type: "Test", value: "Value" }],
        external_url: "https://example.com",
        animation_url: "ipfs://QmAnimation",
        background_color: "FF0000"
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.true;
      expect(result.errors).to.be.empty;
    });

    it("should reject invalid background_color format", function () {
      const metadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: [{ trait_type: "Test", value: "Value" }],
        background_color: "#FF0000" // Should not include #
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.false;
      expect(result.errors).to.include("Field 'background_color' must be a valid hex color (without #)");
    });

    it("should warn about long name", function () {
      const longName = "A".repeat(150);
      const metadata: NFTMetadata = {
        name: longName,
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: [{ trait_type: "Test", value: "Value" }]
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.true;
      expect(result.warnings).to.include("Name is longer than 100 characters - may be truncated on some platforms");
    });

    it("should warn about long description", function () {
      const longDescription = "A".repeat(1500);
      const metadata: NFTMetadata = {
        name: "Test NFT",
        description: longDescription,
        image: "ipfs://QmTest",
        attributes: [{ trait_type: "Test", value: "Value" }]
      };

      const result = validateMetadata(metadata);

      expect(result.valid).to.be.true;
      expect(result.warnings).to.include("Description is longer than 1000 characters - may be truncated on some platforms");
    });
  });

  describe("validateMetadataJSON", function () {
    it("should validate valid JSON string", function () {
      const jsonString = JSON.stringify({
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: [{ trait_type: "Test", value: "Value" }]
      });

      const result = validateMetadataJSON(jsonString);

      expect(result.valid).to.be.true;
      expect(result.errors).to.be.empty;
    });

    it("should reject invalid JSON string", function () {
      const invalidJSON = "{ invalid json }";

      const result = validateMetadataJSON(invalidJSON);

      expect(result.valid).to.be.false;
      expect(result.errors).to.have.lengthOf(1);
      expect(result.errors[0]).to.include("Invalid JSON");
    });

    it("should validate JSON and check metadata structure", function () {
      const jsonString = JSON.stringify({
        name: "Test NFT",
        // missing required fields
        attributes: []
      });

      const result = validateMetadataJSON(jsonString);

      expect(result.valid).to.be.false;
      expect(result.errors).to.include("Field 'description' is required and must be a string");
      expect(result.errors).to.include("Field 'image' is required and must be a string");
    });
  });

  describe("isValidMetadata", function () {
    it("should return true for valid metadata", function () {
      const validMetadata: NFTMetadata = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: [{ trait_type: "Test", value: "Value" }]
      };

      expect(isValidMetadata(validMetadata)).to.be.true;
    });

    it("should return false for invalid metadata", function () {
      const invalidMetadata = {
        name: "Test NFT",
        // missing required fields
      };

      expect(isValidMetadata(invalidMetadata)).to.be.false;
    });

    it("should work as type guard", function () {
      const data: any = {
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: [{ trait_type: "Test", value: "Value" }]
      };

      if (isValidMetadata(data)) {
        // TypeScript should recognize this as NFTMetadata
        expect(data.name).to.be.a("string");
        expect(data.attributes).to.be.an("array");
      }
    });
  });
});

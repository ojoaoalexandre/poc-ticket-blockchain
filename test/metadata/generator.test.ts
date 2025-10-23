import { expect } from "chai";
import {
  generateMetadata,
  generateAttributes,
  metadataToJSON,
  parseMetadata,
  TicketData,
  TRAIT_TYPES
} from "../../utils/metadata";

describe("Metadata Generator", function () {
  describe("generateAttributes", function () {
    it("should generate basic attributes for ticket data", function () {
      const ticketData: TicketData = {
        eventName: "Rock Festival",
        seat: "A-42",
        section: "Pista Premium",
        date: "2025-12-31",
        imageUrl: "ipfs://QmTest"
      };

      const attributes = generateAttributes(ticketData);

      expect(attributes).to.be.an("array");
      expect(attributes).to.have.lengthOf(5);

      // Check event attribute
      const eventAttr = attributes.find(a => a.trait_type === TRAIT_TYPES.EVENT);
      expect(eventAttr).to.exist;
      expect(eventAttr?.value).to.equal("Rock Festival");

      // Check seat attribute
      const seatAttr = attributes.find(a => a.trait_type === TRAIT_TYPES.SEAT);
      expect(seatAttr).to.exist;
      expect(seatAttr?.value).to.equal("A-42");

      // Check section attribute
      const sectionAttr = attributes.find(a => a.trait_type === TRAIT_TYPES.SECTION);
      expect(sectionAttr).to.exist;
      expect(sectionAttr?.value).to.equal("Pista Premium");

      // Check date attribute
      const dateAttr = attributes.find(a => a.trait_type === TRAIT_TYPES.DATE);
      expect(dateAttr).to.exist;
      expect(dateAttr?.value).to.equal("2025-12-31");
      expect(dateAttr?.display_type).to.equal("date");

      // Check status attribute (default)
      const statusAttr = attributes.find(a => a.trait_type === TRAIT_TYPES.STATUS);
      expect(statusAttr).to.exist;
      expect(statusAttr?.value).to.equal("Válido");
    });

    it("should include optional attributes when provided", function () {
      const ticketData: TicketData = {
        eventName: "Rock Festival",
        seat: "A-42",
        section: "Pista Premium",
        date: "2025-12-31",
        imageUrl: "ipfs://QmTest",
        ticketNumber: 1001,
        category: "VIP",
        venue: "Estádio Nacional"
      };

      const attributes = generateAttributes(ticketData);

      expect(attributes).to.have.lengthOf(8);

      // Check ticket number
      const ticketNumAttr = attributes.find(a => a.trait_type === TRAIT_TYPES.TICKET_NUMBER);
      expect(ticketNumAttr).to.exist;
      expect(ticketNumAttr?.value).to.equal(1001);
      expect(ticketNumAttr?.display_type).to.equal("number");

      // Check category
      const categoryAttr = attributes.find(a => a.trait_type === TRAIT_TYPES.CATEGORY);
      expect(categoryAttr).to.exist;
      expect(categoryAttr?.value).to.equal("VIP");

      // Check venue
      const venueAttr = attributes.find(a => a.trait_type === TRAIT_TYPES.VENUE);
      expect(venueAttr).to.exist;
      expect(venueAttr?.value).to.equal("Estádio Nacional");
    });

    it("should use custom status when provided", function () {
      const ticketData: TicketData = {
        eventName: "Rock Festival",
        seat: "A-42",
        section: "Pista Premium",
        date: "2025-12-31",
        imageUrl: "ipfs://QmTest",
        status: "Usado"
      };

      const attributes = generateAttributes(ticketData);
      const statusAttr = attributes.find(a => a.trait_type === TRAIT_TYPES.STATUS);
      expect(statusAttr?.value).to.equal("Usado");
    });
  });

  describe("generateMetadata", function () {
    it("should generate complete metadata for valid ticket data", function () {
      const ticketData: TicketData = {
        eventName: "Rock Festival 2025",
        seat: "A-42",
        section: "Pista Premium",
        date: "2025-12-31",
        imageUrl: "ipfs://QmTest123"
      };

      const metadata = generateMetadata(ticketData);

      expect(metadata).to.have.property("name");
      expect(metadata.name).to.equal("NFT Ticket - Rock Festival 2025 - Assento A-42");

      expect(metadata).to.have.property("description");
      expect(metadata.description).to.include("Rock Festival 2025");
      expect(metadata.description).to.include("31/12/2025");

      expect(metadata).to.have.property("image");
      expect(metadata.image).to.equal("ipfs://QmTest123");

      expect(metadata).to.have.property("attributes");
      expect(metadata.attributes).to.be.an("array");
      expect(metadata.attributes).to.have.lengthOf(5);
    });

    it("should use custom description when provided", function () {
      const ticketData: TicketData = {
        eventName: "Rock Festival",
        seat: "A-42",
        section: "Pista Premium",
        date: "2025-12-31",
        imageUrl: "ipfs://QmTest",
        description: "Custom description for this awesome event"
      };

      const metadata = generateMetadata(ticketData);
      expect(metadata.description).to.equal("Custom description for this awesome event");
    });

    it("should include external URL when provided", function () {
      const ticketData: TicketData = {
        eventName: "Rock Festival",
        seat: "A-42",
        section: "Pista Premium",
        date: "2025-12-31",
        imageUrl: "ipfs://QmTest",
        externalUrl: "https://example.com/event"
      };

      const metadata = generateMetadata(ticketData);
      expect(metadata).to.have.property("external_url");
      expect(metadata.external_url).to.equal("https://example.com/event");
    });

    it("should throw error for missing required fields", function () {
      const invalidData = {
        eventName: "Rock Festival",
        seat: "A-42",
        // missing section and date
        imageUrl: "ipfs://QmTest"
      } as TicketData;

      expect(() => generateMetadata(invalidData)).to.throw("Missing required ticket data fields");
    });

    it("should handle all optional fields together", function () {
      const ticketData: TicketData = {
        eventName: "Festival Tech",
        seat: "B-10",
        section: "VIP",
        date: "2026-06-15",
        imageUrl: "ipfs://QmComplete",
        ticketNumber: 999,
        category: "Premium",
        venue: "Centro de Convenções",
        status: "Válido",
        description: "Complete ticket with all fields",
        externalUrl: "https://techfest.com"
      };

      const metadata = generateMetadata(ticketData);

      expect(metadata.name).to.include("Festival Tech");
      expect(metadata.description).to.equal("Complete ticket with all fields");
      expect(metadata.image).to.equal("ipfs://QmComplete");
      expect(metadata.external_url).to.equal("https://techfest.com");
      expect(metadata.attributes).to.have.lengthOf(8);
    });
  });

  describe("metadataToJSON", function () {
    it("should convert metadata to JSON string with formatting", function () {
      const ticketData: TicketData = {
        eventName: "Rock Festival",
        seat: "A-42",
        section: "Pista Premium",
        date: "2025-12-31",
        imageUrl: "ipfs://QmTest"
      };

      const metadata = generateMetadata(ticketData);
      const json = metadataToJSON(metadata, true);

      expect(json).to.be.a("string");
      expect(json).to.include('"name"');
      expect(json).to.include('"description"');
      expect(json).to.include('"image"');
      expect(json).to.include('"attributes"');

      // Check formatting (should have indentation)
      expect(json).to.include('\n');
    });

    it("should convert metadata to compact JSON when pretty is false", function () {
      const ticketData: TicketData = {
        eventName: "Rock Festival",
        seat: "A-42",
        section: "Pista Premium",
        date: "2025-12-31",
        imageUrl: "ipfs://QmTest"
      };

      const metadata = generateMetadata(ticketData);
      const json = metadataToJSON(metadata, false);

      expect(json).to.be.a("string");
      // Compact JSON should not have unnecessary whitespace
      expect(json).to.not.match(/\n\s+/);
    });
  });

  describe("parseMetadata", function () {
    it("should parse valid JSON string to metadata object", function () {
      const jsonString = JSON.stringify({
        name: "Test NFT",
        description: "Test description",
        image: "ipfs://QmTest",
        attributes: [
          { trait_type: "Event", value: "Test Event" }
        ]
      });

      const metadata = parseMetadata(jsonString);

      expect(metadata).to.be.an("object");
      expect(metadata.name).to.equal("Test NFT");
      expect(metadata.description).to.equal("Test description");
      expect(metadata.image).to.equal("ipfs://QmTest");
      expect(metadata.attributes).to.have.lengthOf(1);
    });

    it("should throw error for invalid JSON", function () {
      const invalidJSON = "{ invalid json }";

      expect(() => parseMetadata(invalidJSON)).to.throw("Invalid JSON");
    });

    it("should round-trip metadata through JSON conversion", function () {
      const ticketData: TicketData = {
        eventName: "Rock Festival",
        seat: "A-42",
        section: "Pista Premium",
        date: "2025-12-31",
        imageUrl: "ipfs://QmTest"
      };

      const originalMetadata = generateMetadata(ticketData);
      const json = metadataToJSON(originalMetadata);
      const parsedMetadata = parseMetadata(json);

      expect(parsedMetadata.name).to.equal(originalMetadata.name);
      expect(parsedMetadata.description).to.equal(originalMetadata.description);
      expect(parsedMetadata.image).to.equal(originalMetadata.image);
      expect(parsedMetadata.attributes).to.deep.equal(originalMetadata.attributes);
    });
  });
});

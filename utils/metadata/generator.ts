import {
  NFTMetadata,
  NFTAttribute,
  TicketData,
  TRAIT_TYPES
} from "./types";

export function generateAttributes(ticketData: TicketData): NFTAttribute[] {
  const dateTimestamp = Math.floor(new Date(ticketData.date).getTime() / 1000);

  const attributes: NFTAttribute[] = [
    {
      trait_type: TRAIT_TYPES.EVENT,
      value: ticketData.eventName
    },
    {
      trait_type: TRAIT_TYPES.SEAT,
      value: ticketData.seat
    },
    {
      trait_type: TRAIT_TYPES.SECTION,
      value: ticketData.section
    },
    {
      trait_type: TRAIT_TYPES.DATE,
      value: dateTimestamp,
      display_type: "date"
    },
    {
      trait_type: TRAIT_TYPES.STATUS,
      value: ticketData.status || "Válido"
    }
  ];

  if (ticketData.ticketNumber !== undefined) {
    attributes.push({
      trait_type: TRAIT_TYPES.TICKET_NUMBER,
      value: ticketData.ticketNumber,
      display_type: "number"
    });
  }

  if (ticketData.category) {
    attributes.push({
      trait_type: TRAIT_TYPES.CATEGORY,
      value: ticketData.category
    });
  }

  if (ticketData.venue) {
    attributes.push({
      trait_type: TRAIT_TYPES.VENUE,
      value: ticketData.venue
    });
  }

  return attributes;
}

export function generateMetadata(ticketData: TicketData): NFTMetadata {
  if (!ticketData.eventName || !ticketData.seat || !ticketData.section || !ticketData.date) {
    throw new Error("Missing required ticket data fields");
  }

  const name = `NFT Ticket - ${ticketData.eventName} - Assento ${ticketData.seat}`;

  const description = ticketData.description ||
    `Ingresso NFT verificado na blockchain para ${ticketData.eventName}. ` +
    `Assento ${ticketData.seat}, Setor ${ticketData.section}. ` +
    `Data do evento: ${formatDate(ticketData.date)}.`;

  const attributes = generateAttributes(ticketData);

  const metadata: NFTMetadata = {
    name,
    description,
    image: ticketData.imageUrl,
    attributes
  };

  if (ticketData.externalUrl) {
    metadata.external_url = ticketData.externalUrl;
  }

  return metadata;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function metadataToJSON(metadata: NFTMetadata, pretty: boolean = true): string {
  return JSON.stringify(metadata, null, pretty ? 2 : 0);
}

export function parseMetadata(json: string): NFTMetadata {
  try {
    return JSON.parse(json) as NFTMetadata;
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

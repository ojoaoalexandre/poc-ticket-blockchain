export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'date' | 'number';
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  external_url?: string;
}

export interface TicketData {
  eventName: string;
  description: string;
  eventId: string | number;
  seat: string;
  section: string;
  date: number;
  ticketNumber?: number;
  category?: string;
  venue?: string;
  status?: string;
  externalUrl?: string;
}

export interface MetadataValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class MetadataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MetadataError';
  }
}

export class InvalidMetadataError extends MetadataError {
  constructor(field: string) {
    super(`Invalid or missing required field: ${field}`);
    this.name = 'InvalidMetadataError';
  }
}

function validateTicketData(ticketData: TicketData): void {
  const requiredFields: (keyof TicketData)[] = [
    'eventName',
    'description',
    'eventId',
    'seat',
    'section',
    'date'
  ];

  for (const field of requiredFields) {
    if (!ticketData[field]) {
      throw new InvalidMetadataError(field);
    }
  }

  if (typeof ticketData.date !== 'number' || ticketData.date <= 0) {
    throw new InvalidMetadataError('date must be a positive Unix timestamp');
  }
}

export function validateMetadata(metadata: any): MetadataValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!metadata.name || typeof metadata.name !== 'string') {
    errors.push('Missing or invalid field: name (must be a string)');
  }

  if (!metadata.description || typeof metadata.description !== 'string') {
    errors.push('Missing or invalid field: description (must be a string)');
  }

  if (!metadata.image || typeof metadata.image !== 'string') {
    errors.push('Missing or invalid field: image (must be a string)');
  } else {
    if (!metadata.image.startsWith('ipfs://') &&
        !metadata.image.startsWith('https://') &&
        !metadata.image.startsWith('http://')) {
      errors.push('Invalid image URL format (must start with ipfs://, https://, or http://)');
    }

    if (metadata.image.startsWith('http://')) {
      warnings.push('Image URL uses http:// instead of https:// - not recommended');
    }
  }

  if (!Array.isArray(metadata.attributes)) {
    errors.push('Missing or invalid field: attributes (must be an array)');
  } else {
    metadata.attributes.forEach((attr: any, index: number) => {
      if (!attr.trait_type || typeof attr.trait_type !== 'string') {
        errors.push(`Attribute ${index}: missing or invalid trait_type`);
      }
      if (attr.value === undefined || attr.value === null) {
        errors.push(`Attribute ${index}: missing value`);
      }
      if (attr.display_type && !['date', 'number'].includes(attr.display_type)) {
        warnings.push(`Attribute ${index}: unknown display_type "${attr.display_type}"`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function generateAttributes(ticketData: TicketData): NFTAttribute[] {
  const attributes: NFTAttribute[] = [
    {
      trait_type: "Evento",
      value: ticketData.eventName
    },
    {
      trait_type: "ID do Evento",
      value: ticketData.eventId.toString()
    },
    {
      trait_type: "Assento",
      value: ticketData.seat
    },
    {
      trait_type: "Setor",
      value: ticketData.section
    },
    {
      trait_type: "Data",
      display_type: "date",
      value: ticketData.date
    }
  ];

  if (ticketData.ticketNumber !== undefined) {
    attributes.push({
      trait_type: "Número do Ingresso",
      display_type: "number",
      value: ticketData.ticketNumber
    });
  }

  if (ticketData.category) {
    attributes.push({
      trait_type: "Categoria",
      value: ticketData.category
    });
  }

  if (ticketData.venue) {
    attributes.push({
      trait_type: "Local",
      value: ticketData.venue
    });
  }

  if (ticketData.status) {
    attributes.push({
      trait_type: "Status",
      value: ticketData.status
    });
  }

  return attributes;
}

export function generateMetadata(ticketData: TicketData, imageUrl: string): NFTMetadata {
  validateTicketData(ticketData);

  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new InvalidMetadataError('imageUrl is required and must be a string');
  }

  const metadata: NFTMetadata = {
    name: `NFT Ticket - ${ticketData.eventName} - Assento ${ticketData.seat}`,
    description: ticketData.description,
    image: imageUrl,
    attributes: generateAttributes(ticketData)
  };

  if (ticketData.externalUrl) {
    metadata.external_url = ticketData.externalUrl;
  }

  return metadata;
}

export function metadataToJSON(metadata: NFTMetadata, pretty: boolean = false): string {
  return JSON.stringify(metadata, null, pretty ? 2 : 0);
}

export function parseMetadata(json: string): NFTMetadata {
  try {
    return JSON.parse(json) as NFTMetadata;
  } catch (error) {
    throw new MetadataError(
      `Failed to parse metadata JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

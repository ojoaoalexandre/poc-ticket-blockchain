export type DisplayType =
  | "number"
  | "boost_number"
  | "boost_percentage"
  | "date";

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: DisplayType;
  max_value?: number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  animation_url?: string;
  external_url?: string;
  background_color?: string;
}

export interface TicketData {
  eventName: string;
  seat: string;
  section: string;
  date: string;
  imageUrl: string;
  description?: string;
  ticketNumber?: number;
  category?: string;
  status?: "Válido" | "Usado" | "Cancelado";
  venue?: string;
  externalUrl?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export type TicketStatus = "Válido" | "Usado" | "Cancelado";

export const TRAIT_TYPES = {
  EVENT: "Evento",
  SEAT: "Assento",
  SECTION: "Setor",
  DATE: "Data",
  STATUS: "Status",
  TICKET_NUMBER: "Número do Ticket",
  CATEGORY: "Categoria",
  VENUE: "Local"
} as const;



export interface TicketMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

export interface Ticket {
  
  tokenId: bigint;
  owner: string;
  tokenURI: string;
  
  
  eventId: bigint;
  seat: string;
  sector: string;
  eventDate: bigint;
  checkedIn: boolean;
  
  
  metadata?: TicketMetadata;
}

export type TicketStatus = 'valid' | 'checked-in' | 'expired';

export function getTicketStatus(ticket: Ticket): TicketStatus {
  const now = Math.floor(Date.now() / 1000); 
  const eventDate = Number(ticket.eventDate);
  
  if (ticket.checkedIn) {
    return 'checked-in';
  } else if (eventDate < now) {
    return 'expired';
  } else {
    return 'valid';
  }
}

export const TICKET_STATUS_CONFIG = {
  'valid': {
    label: 'Válido',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    icon: '✅',
  },
  'checked-in': {
    label: 'Check-in Realizado',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    icon: '✓',
  },
  'expired': {
    label: 'Evento Passou',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
    icon: '⏰',
  },
} as const;



import { z } from 'zod';

const ETHEREUM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const mintTicketSchema = z.object({
  
  eventName: z
    .string()
    .min(3, 'Nome do evento deve ter no mínimo 3 caracteres')
    .max(100, 'Nome do evento deve ter no máximo 100 caracteres')
    .trim(),

  eventDate: z
    .string()
    .min(1, 'Data do evento é obrigatória')
    .refine((date) => {
      const selectedDate = new Date(date);
      const now = new Date();
      now.setHours(0, 0, 0, 0); 
      return selectedDate >= now;
    }, 'Data do evento deve ser no futuro'),

  
  ticketType: z
    .string()
    .min(2, 'Tipo de ingresso deve ter no mínimo 2 caracteres')
    .max(50, 'Tipo de ingresso deve ter no máximo 50 caracteres')
    .trim(),

  sector: z
    .string()
    .min(1, 'Setor é obrigatório')
    .max(50, 'Setor deve ter no máximo 50 caracteres')
    .trim(),

  seat: z
    .string()
    .min(1, 'Assento é obrigatório')
    .max(20, 'Assento deve ter no máximo 20 caracteres')
    .trim(),

  
  recipientAddress: z
    .string()
    .min(1, 'Endereço do destinatário é obrigatório')
    .regex(ETHEREUM_ADDRESS_REGEX, 'Endereço Ethereum inválido')
    .refine((address) => {
      
      return address.toLowerCase() !== '0x0000000000000000000000000000000000000000';
    }, 'Endereço zero não é permitido'),

  
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type MintTicketFormData = z.infer<typeof mintTicketSchema>;

export const defaultMintTicketValues: Partial<MintTicketFormData> = {
  eventName: '',
  eventDate: '',
  ticketType: '',
  sector: '',
  seat: '',
  recipientAddress: '',
  description: '',
};

export function isValidEthereumAddress(address: string): boolean {
  return ETHEREUM_ADDRESS_REGEX.test(address);
}

export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMinDate(): string {
  const today = new Date();
  return formatDateForInput(today);
}


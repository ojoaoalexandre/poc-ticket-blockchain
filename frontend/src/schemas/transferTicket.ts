import { z } from 'zod';
import { isAddress } from 'viem';

export const transferTicketSchema = z.object({
  recipientAddress: z
    .string()
    .min(1, 'Endereço é obrigatório')
    .refine((addr) => isAddress(addr), {
      message: 'Endereço Ethereum inválido',
    })
    .refine((addr) => addr.toLowerCase() !== '0x0000000000000000000000000000000000000000', {
      message: 'Endereço não pode ser zero',
    }),
});

export type TransferTicketFormData = z.infer<typeof transferTicketSchema>;

export const defaultTransferTicketValues: TransferTicketFormData = {
  recipientAddress: '',
};


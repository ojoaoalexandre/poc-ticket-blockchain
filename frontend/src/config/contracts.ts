

import { EVENT_TICKET_ABI, type ContractConfig } from '../types/contract';

const EVENT_TICKET_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || '0x') as `0x${string}`;

const DEPLOYMENT_BLOCK = BigInt(import.meta.env.VITE_DEPLOYMENT_BLOCK || '27983078');

export const eventTicketContract: ContractConfig = {
  address: EVENT_TICKET_ADDRESS,
  abi: EVENT_TICKET_ABI,
};

export function getDeploymentBlock(): bigint {
  return DEPLOYMENT_BLOCK;
}

export function isContractConfigured(): boolean {
  return EVENT_TICKET_ADDRESS !== '0x' && EVENT_TICKET_ADDRESS.length === 42;
}



import type { TicketMetadata } from '../types/ticket';

export const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
] as const;

export function ipfsToHttp(uri: string, gatewayIndex = 0): string {
  if (!uri) return '';

  const cid = uri.replace('ipfs://', '').replace('ipfs/', '');

  const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];

  return `${gateway}${cid}`;
}

export async function fetchIPFSMetadata(tokenURI: string): Promise<TicketMetadata> {
  if (!tokenURI) {
    throw new Error('Token URI is empty');
  }

  let lastError: Error | null = null;

  
  for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
    try {
      const url = ipfsToHttp(tokenURI, i);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const metadata = await response.json();

      
      if (!metadata.name || !metadata.image) {
        throw new Error('Invalid metadata: missing required fields');
      }

      return metadata as TicketMetadata;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Gateway ${i} failed:`, lastError.message);
      
    }
  }

  
  throw new Error(`Failed to fetch metadata from all gateways: ${lastError?.message}`);
}

export function createPlaceholderMetadata(tokenId: bigint): TicketMetadata {
  return {
    name: `Ticket #${tokenId}`,
    description: 'Metadata não disponível no momento',
    image: '/placeholder-ticket.png', 
    attributes: [],
  };
}

export async function fetchMetadataWithFallback(
  tokenURI: string,
  tokenId: bigint
): Promise<TicketMetadata> {
  try {
    return await fetchIPFSMetadata(tokenURI);
  } catch (error) {
    console.error(`Failed to fetch metadata for token ${tokenId}:`, error);
    return createPlaceholderMetadata(tokenId);
  }
}



import { useState } from 'react';
import { useTicketContract } from './useTicketContract';
import type { Address } from 'viem';

export interface MintTicketParams {
  recipient: Address;
  eventId: bigint;
  seat: string;
  sector: string;
  eventDate: bigint;
  imagePath?: string;
  eventName: string;
  description: string;
}

export interface MintTicketResult {
  success: boolean;
  tokenId?: bigint;
  transactionHash?: string;
  ipfsUri?: string;
  error?: string;
}

export function useMintTicket() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    mintTicket,
    isPending,
    isConfirming,
    isConfirmed,
    error: mintError,
    hash,
  } = useTicketContract();

  
  const mint = async (params: MintTicketParams): Promise<MintTicketResult> => {
    setIsUploading(false);
    setUploadError(null);

    try {
      
      
      
      
      
      
      
      
      
      

      
      const tokenURI = `ipfs://placeholder`;

      const txHash = await mintTicket(
        params.recipient,
        params.eventId,
        params.seat,
        params.sector,
        params.eventDate,
        tokenURI
      );

      return {
        success: true,
        transactionHash: txHash,
        ipfsUri: tokenURI,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setUploadError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    mint,
    isUploading,
    isMinting: isPending,
    isConfirming,
    isConfirmed,
    uploadError,
    mintError,
    hash,
    
    isLoading: isUploading || isPending || isConfirming,
  };
}

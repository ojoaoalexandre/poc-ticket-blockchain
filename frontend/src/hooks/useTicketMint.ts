

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { v4 as uuidv4 } from 'uuid';
import { eventTicketContract } from '../config/contracts';
import { generateTicketFile } from '../utils/ticketGenerator';
import { uploadTicketToIPFS } from '../utils/pinata';
import type { MintTicketFormData } from '../schemas/mintTicket';

export interface MintStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  message?: string;
}

export interface MintResult {
  success: boolean;
  tokenId?: bigint;
  transactionHash?: string;
  error?: string;
  ipfsMetadataUrl?: string;
  ipfsImageUrl?: string;
}

export function useTicketMint() {
  const { address: connectedAddress } = useAccount();
  const [steps, setSteps] = useState<MintStep[]>([]);
  const [result, setResult] = useState<MintResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  
  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract();

  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  
  const updateStep = useCallback((id: string, updates: Partial<MintStep>) => {
    setSteps(prev => 
      prev.map(step => 
        step.id === id ? { ...step, ...updates } : step
      )
    );
  }, []);

  
  const initializeSteps = useCallback(() => {
    const initialSteps: MintStep[] = [
      {
        id: 'validate',
        title: 'Validando formulário',
        status: 'pending',
      },
      {
        id: 'generate-image',
        title: 'Gerando imagem do ticket',
        status: 'pending',
      },
      {
        id: 'upload-ipfs',
        title: 'Fazendo upload para IPFS',
        status: 'pending',
      },
      {
        id: 'mint-nft',
        title: 'Mintando NFT na blockchain',
        status: 'pending',
      },
      {
        id: 'confirm',
        title: 'Aguardando confirmação',
        status: 'pending',
      },
    ];
    setSteps(initialSteps);
  }, []);

  
  const generateMetadata = useCallback((
    formData: MintTicketFormData,
    eventId: string,
    imageUri: string
  ) => {
    return {
      name: `${formData.eventName} - ${formData.sector} - ${formData.seat}`,
      description: formData.description || `Ingresso NFT para ${formData.eventName}`,
      image: imageUri,
      attributes: [
        {
          trait_type: 'Event Name',
          value: formData.eventName,
        },
        {
          trait_type: 'Event Date',
          value: formData.eventDate,
        },
        {
          trait_type: 'Ticket Type',
          value: formData.ticketType,
        },
        {
          trait_type: 'Sector',
          value: formData.sector,
        },
        {
          trait_type: 'Seat',
          value: formData.seat,
        },
        {
          trait_type: 'Event ID',
          value: eventId,
        },
      ],
    };
  }, []);

  
  const mintTicket = useCallback(async (formData: MintTicketFormData) => {
    try {
      setIsProcessing(true);
      setResult(null);
      initializeSteps();

      
      updateStep('validate', { status: 'in-progress', message: 'Validando dados...' });
      
      if (!connectedAddress) {
        throw new Error('Carteira não conectada');
      }

      
      const eventId = uuidv4();
      const eventIdNumeric = BigInt('0x' + eventId.replace(/-/g, '').slice(0, 16));

      updateStep('validate', { status: 'completed', message: 'Dados validados!' });

      
      updateStep('generate-image', { status: 'in-progress', message: 'Gerando imagem...' });
      
      const ticketFile = await generateTicketFile({
        eventName: formData.eventName,
        eventDate: new Date(formData.eventDate),
        ticketType: formData.ticketType,
        sector: formData.sector,
        seat: formData.seat,
        eventId: eventId,
        tokenId: 'TBD', 
        contractAddress: eventTicketContract.address,
      });

      updateStep('generate-image', { status: 'completed', message: 'Imagem gerada!' });

      
      updateStep('upload-ipfs', { status: 'in-progress', message: 'Fazendo upload para IPFS...' });
      
      const metadata = generateMetadata(formData, eventId, ''); 
      
      const ipfsResult = await uploadTicketToIPFS(
        ticketFile,
        metadata,
        `ticket-${eventId}`
      );

      updateStep('upload-ipfs', { 
        status: 'completed', 
        message: `Upload concluído! CID: ${ipfsResult.metadataCID.slice(0, 8)}...` 
      });

      
      updateStep('mint-nft', { status: 'in-progress', message: 'Iniciando transação...' });

      
      const eventDateTimestamp = BigInt(Math.floor(new Date(formData.eventDate).getTime() / 1000));

      
      writeContract({
        address: eventTicketContract.address,
        abi: eventTicketContract.abi,
        functionName: 'mintTicket',
        args: [
          formData.recipientAddress as `0x${string}`,
          eventIdNumeric,
          formData.seat,
          formData.sector,
          eventDateTimestamp,
          ipfsResult.tokenURI,
        ],
      });

      
      return {
        eventId,
        ipfsResult,
      };

    } catch (error) {
      console.error('Mint error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      
      const currentStep = steps.find(s => s.status === 'in-progress');
      if (currentStep) {
        updateStep(currentStep.id, { 
          status: 'error', 
          message: errorMessage 
        });
      }

      setResult({
        success: false,
        error: errorMessage,
      });
      setIsProcessing(false);
      throw error;
    }
  }, [connectedAddress, generateMetadata, initializeSteps, steps, updateStep, writeContract]);

  
  const reset = useCallback(() => {
    setSteps([]);
    setResult(null);
    setIsProcessing(false);
  }, []);

  return {
    
    steps,
    result,
    isProcessing,
    isWritePending,
    isConfirming,
    isConfirmed,
    writeError,
    transactionHash: hash,

    
    mintTicket,
    reset,
  };
}


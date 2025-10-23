import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import type { Address } from 'viem';
import { eventTicketContract } from '../config/contracts';
import type { TransferTicketFormData } from '../schemas/transferTicket';

export interface TransferStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  message?: string;
}

export interface TransferResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export function useTicketTransfer() {
  const { address: connectedAddress } = useAccount();
  const [steps, setSteps] = useState<TransferStep[]>([]);
  const [result, setResult] = useState<TransferResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const updateStep = useCallback((id: string, updates: Partial<TransferStep>) => {
    setSteps(prev => 
      prev.map(step => 
        step.id === id ? { ...step, ...updates } : step
      )
    );
  }, []);

  const initializeSteps = useCallback(() => {
    const initialSteps: TransferStep[] = [
      {
        id: 'validate',
        title: 'Validando dados',
        status: 'pending',
      },
      {
        id: 'transfer',
        title: 'Executando transferência',
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

  const transferTicket = useCallback(async (
    formData: TransferTicketFormData,
    tokenId: bigint
  ) => {
    try {
      setIsProcessing(true);
      setResult(null);
      initializeSteps();

      updateStep('validate', { status: 'in-progress', message: 'Validando endereço...' });
      
      if (!connectedAddress) {
        throw new Error('Carteira não conectada');
      }

      updateStep('validate', { status: 'completed', message: 'Endereço validado!' });

      updateStep('transfer', { status: 'in-progress', message: 'Iniciando transferência...' });

      writeContract({
        address: eventTicketContract.address,
        abi: eventTicketContract.abi,
        functionName: 'safeTransferFrom',
        args: [
          connectedAddress as Address,
          formData.recipientAddress as Address,
          tokenId,
        ],
      });

      return { tokenId };

    } catch (error) {
      console.error('Transfer error:', error);
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
  }, [connectedAddress, initializeSteps, steps, updateStep, writeContract]);

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
    transferTicket,
    reset,
  };
}


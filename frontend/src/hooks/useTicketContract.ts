import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { eventTicketContract } from '../config/contracts';
import type { Address } from 'viem';

export function useTicketContract() {
  const {
    writeContractAsync,
    data: hash,
    isPending,
    error: writeError
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed
  } = useWaitForTransactionReceipt({
    hash
  });

  const mintTicket = async (
    recipient: Address,
    eventId: bigint,
    seat: string,
    sector: string,
    eventDate: bigint,
    tokenURI: string
  ) => {
    return writeContractAsync({
      ...eventTicketContract,
      functionName: 'mintTicket',
      args: [recipient, eventId, seat, sector, eventDate, tokenURI],
    });
  };

  const checkIn = async (tokenId: bigint) => {
    return writeContractAsync({
      ...eventTicketContract,
      functionName: 'checkIn',
      args: [tokenId],
    });
  };

  const useGetTicketInfo = (tokenId?: bigint) => {
    return useReadContract({
      ...eventTicketContract,
      functionName: 'getTicketInfo',
      args: tokenId !== undefined ? [tokenId] : undefined,
      query: {
        enabled: tokenId !== undefined,
      },
    });
  };

  const useGetCompleteTicketInfo = (tokenId?: bigint) => {
    return useReadContract({
      ...eventTicketContract,
      functionName: 'getCompleteTicketInfo',
      args: tokenId !== undefined ? [tokenId] : undefined,
      query: {
        enabled: tokenId !== undefined,
      },
    });
  };

  const useIsTicketValid = (tokenId?: bigint) => {
    return useReadContract({
      ...eventTicketContract,
      functionName: 'isTicketValid',
      args: tokenId !== undefined ? [tokenId] : undefined,
      query: {
        enabled: tokenId !== undefined,
      },
    });
  };

  const useIsTicketCheckedIn = (tokenId?: bigint) => {
    return useReadContract({
      ...eventTicketContract,
      functionName: 'isTicketCheckedIn',
      args: tokenId !== undefined ? [tokenId] : undefined,
      query: {
        enabled: tokenId !== undefined,
      },
    });
  };

  return {
    mintTicket,
    checkIn,
    useGetTicketInfo,
    useGetCompleteTicketInfo,
    useIsTicketValid,
    useIsTicketCheckedIn,
    isPending,
    isConfirming,
    isConfirmed,
    error: writeError,
    hash,
  };
}

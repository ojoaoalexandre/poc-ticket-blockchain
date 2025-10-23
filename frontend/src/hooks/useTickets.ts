

import { useAccount, usePublicClient } from 'wagmi';
import { useState, useEffect, useCallback } from 'react';
import { parseAbiItem } from 'viem';
import type { Ticket } from '../types/ticket';
import { eventTicketContract, getDeploymentBlock } from '../config/contracts';
import { fetchMetadataWithFallback } from '../utils/ipfs';

export function useTickets() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  
  const fetchTickets = useCallback(async () => {
    if (!isConnected || !address || !publicClient) {
      setTickets([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      
      
      const logs = await publicClient.getLogs({
        address: eventTicketContract.address,
        event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'),
        args: { to: address },
        fromBlock: getDeploymentBlock(), 
      });

      
      const potentialTokenIds = [...new Set(logs.map(log => log.args.tokenId))].filter(
        (id): id is bigint => id !== undefined
      );

      if (potentialTokenIds.length === 0) {
        setTickets([]);
        return;
      }

      
      const ticketPromises = potentialTokenIds.map(async (tokenId) => {
        try {
          
          const owner = await publicClient.readContract({
            ...eventTicketContract,
            functionName: 'ownerOf',
            args: [tokenId],
          }) as `0x${string}`;

          
          if (owner.toLowerCase() !== address.toLowerCase()) {
            return null;
          }

          
          const [ticketData, uri, currentOwner] = await publicClient.readContract({
            ...eventTicketContract,
            functionName: 'getCompleteTicketInfo',
            args: [tokenId],
          }) as [
            { eventId: bigint; seat: string; sector: string; eventDate: bigint; checkedIn: boolean },
            string,
            `0x${string}`
          ];

          
          const metadata = await fetchMetadataWithFallback(uri, tokenId);

          
          const ticket: Ticket = {
            tokenId,
            owner: currentOwner,
            tokenURI: uri,
            eventId: ticketData.eventId,
            seat: ticketData.seat,
            sector: ticketData.sector,
            eventDate: ticketData.eventDate,
            checkedIn: ticketData.checkedIn,
            metadata,
          };

          return ticket;
        } catch (err) {
          console.error(`Error fetching ticket ${tokenId}:`, err);
          return null; 
        }
      });

      
      const fetchedTickets = await Promise.all(ticketPromises);

      
      const validTickets = fetchedTickets.filter((ticket): ticket is Ticket => ticket !== null);

      
      validTickets.sort((a, b) => Number(b.tokenId - a.tokenId));

      setTickets(validTickets);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch tickets'));
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, publicClient]);

  
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  
  const refresh = useCallback(async () => {
    await fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    isLoading,
    error,
    refresh,
  };
}

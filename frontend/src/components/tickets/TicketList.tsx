

import { useState } from 'react';
import { TicketCard } from './TicketCard';
import { Spinner } from '../ui';
import type { Ticket } from '../../types/ticket';

interface TicketListProps {
  tickets: Ticket[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 9; 

export function TicketList({ tickets, isLoading, error, onRefresh }: TicketListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  
  const totalPages = Math.ceil(tickets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedTickets = tickets.slice(startIndex, endIndex);

  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner />
        <p className="mt-4 text-gray-600">Carregando seus ingressos...</p>
      </div>
    );
  }

  
  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-red-900 mb-2">
          Erro ao Carregar Ingressos
        </h3>
        <p className="text-red-700 mb-4">
          {error.message || 'Ocorreu um erro desconhecido'}
        </p>
        <button
          onClick={onRefresh}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  
  if (tickets.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">🎫</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Nenhum Ingresso Encontrado
        </h3>
        <p className="text-gray-600 mb-6">
          Você ainda não possui ingressos NFT nesta carteira.
        </p>
        <a
          href="/mint"
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium"
        >
          Criar Primeiro Ingresso
        </a>
      </div>
    );
  }

  
  return (
    <div className="space-y-6">
      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedTickets.map((ticket) => (
          <TicketCard key={ticket.tokenId.toString()} ticket={ticket} />
        ))}
      </div>

      {}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          {}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              ← Anterior
            </button>

            <span className="px-4 py-2 text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              Próxima →
            </button>
          </div>

          {}
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Atualizar</span>
          </button>
        </div>
      )}

      {}
      <p className="text-center text-sm text-gray-500">
        Mostrando {startIndex + 1}-{Math.min(endIndex, tickets.length)} de {tickets.length} ingressos
      </p>
    </div>
  );
}


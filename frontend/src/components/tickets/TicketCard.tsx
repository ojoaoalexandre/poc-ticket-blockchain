

import { useMemo, useState } from 'react';
import type { Ticket } from '../../types/ticket';
import { getTicketStatus, TICKET_STATUS_CONFIG } from '../../types/ticket';
import { ipfsToHttp } from '../../utils/ipfs';
import { TransferTicketModal } from './TransferTicketModal';

interface TicketCardProps {
  ticket: Ticket;
  onRefresh?: () => void;
}

function formatEventDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function TicketCard({ ticket, onRefresh }: TicketCardProps) {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const status = useMemo(() => getTicketStatus(ticket), [ticket]);
  const statusConfig = TICKET_STATUS_CONFIG[status];

  const imageUrl = useMemo(() => {
    if (!ticket.metadata?.image) return '/placeholder-ticket.png';
    return ipfsToHttp(ticket.metadata.image);
  }, [ticket.metadata]);

  const canTransfer = status === 'valid';

  const handleTransferSuccess = () => {
    setIsTransferModalOpen(false);
    onRefresh?.();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
      {}
      <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100">
        <img
          src={imageUrl}
          alt={ticket.metadata?.name || `Ticket #${ticket.tokenId}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            
            e.currentTarget.src = '/placeholder-ticket.png';
          }}
        />
        
        {}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
          #{ticket.tokenId.toString()}
        </div>
      </div>

      {}
      <div className="p-4">
        {}
        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
          🎫 {ticket.metadata?.name || `Ticket #${ticket.tokenId}`}
        </h3>

        {}
        <div className="space-y-1 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{formatEventDate(ticket.eventDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{ticket.sector} - Assento {ticket.seat}</span>
          </div>
        </div>

        {}
        <div className={`
          inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
          ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border
        `}>
          <span>{statusConfig.icon}</span>
          <span>{statusConfig.label}</span>
        </div>

        {}
        {ticket.metadata?.description && (
          <p className="mt-3 text-xs text-gray-500 line-clamp-2">
            {ticket.metadata.description}
          </p>
        )}

        {canTransfer && (
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <span>🔄</span>
            <span>Transferir Ticket</span>
          </button>
        )}
      </div>

      <TransferTicketModal
        ticket={ticket}
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={handleTransferSuccess}
      />
    </div>
  );
}


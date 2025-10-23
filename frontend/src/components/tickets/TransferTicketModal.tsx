import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { 
  transferTicketSchema, 
  type TransferTicketFormData,
  defaultTransferTicketValues,
} from '../../schemas/transferTicket';
import { useTicketTransfer } from '../../hooks/useTicketTransfer';
import type { Ticket } from '../../types/ticket';

interface TransferTicketModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransferTicketModal({ ticket, isOpen, onClose, onSuccess }: TransferTicketModalProps) {
  const { address: connectedAddress, isConnected } = useAccount();
  const { transferTicket, steps, isProcessing, transactionHash, isConfirmed } = useTicketTransfer();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset: resetForm,
  } = useForm<TransferTicketFormData>({
    resolver: zodResolver(transferTicketSchema),
    defaultValues: defaultTransferTicketValues,
  });

  useEffect(() => {
    if (isConfirmed && transactionHash) {
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 3000);
    }
  }, [isConfirmed, transactionHash, onSuccess]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const onSubmit = async (data: TransferTicketFormData) => {
    try {
      await transferTicket(data, ticket.tokenId);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (!isOpen) {
    return null;
  }

  if (!isConnected) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <span className="text-4xl mb-3 block">⚠️</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Carteira Não Conectada</h3>
            <p className="text-gray-600 mb-4">
              Por favor, conecte sua carteira para transferir tickets.
            </p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isConfirmed && transactionHash) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Transferência Concluída!
              </h2>
              <p className="text-gray-600">
                Seu ticket foi transferido com sucesso
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Transaction Hash:</p>
              <a
                href={`https://amoy.polygonscan.com/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-mono text-sm break-all"
              >
                {transactionHash}
              </a>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing || steps.length > 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Processando Transferência...
          </h2>
          
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`
                  flex items-start gap-4 p-4 rounded-lg border-2
                  ${step.status === 'completed' ? 'bg-green-50 border-green-200' : ''}
                  ${step.status === 'in-progress' ? 'bg-blue-50 border-blue-200' : ''}
                  ${step.status === 'error' ? 'bg-red-50 border-red-200' : ''}
                  ${step.status === 'pending' ? 'bg-gray-50 border-gray-200' : ''}
                `}
              >
                <div className="flex-shrink-0 mt-1">
                  {step.status === 'completed' && <span className="text-2xl">✅</span>}
                  {step.status === 'in-progress' && (
                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                  {step.status === 'error' && <span className="text-2xl">❌</span>}
                  {step.status === 'pending' && <span className="text-2xl">⏱️</span>}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  {step.message && (
                    <p className="text-sm text-gray-600 mt-1">{step.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Transferir Ticket
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎫</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {ticket.metadata?.name || `Ticket #${ticket.tokenId}`}
              </h3>
              <p className="text-sm text-gray-600">
                {ticket.sector} - Assento {ticket.seat}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Endereço do Destinatário *
            </label>
            <input
              {...register('recipientAddress')}
              type="text"
              id="recipientAddress"
              placeholder="0x..."
              className={`
                w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm
                ${errors.recipientAddress ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {errors.recipientAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.recipientAddress.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Insira o endereço Ethereum da carteira de destino
            </p>
          </div>

          {connectedAddress && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>⚠️ Atenção:</strong> Esta ação é irreversível. Certifique-se de que o endereço está correto antes de confirmar.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isProcessing}
              className={`
                flex-1 py-3 px-6 rounded-lg font-medium text-white transition-colors
                ${isSubmitting || isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }
              `}
            >
              {isSubmitting || isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </span>
              ) : (
                '🔄 Transferir'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


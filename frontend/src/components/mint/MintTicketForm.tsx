import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import {
  mintTicketSchema,
  type MintTicketFormData,
  defaultMintTicketValues,
  getMinDate,
} from '../../schemas/mintTicket';
import { useTicketMint } from '../../hooks/useTicketMint';

export function MintTicketForm() {
  const { address, isConnected } = useAccount();
  const { mintTicket, steps, isProcessing, transactionHash, isConfirmed } = useTicketMint();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<MintTicketFormData>({
    resolver: zodResolver(mintTicketSchema),
    defaultValues: defaultMintTicketValues,
  });

  useEffect(() => {
    if (address && !watch('recipientAddress')) {
      setValue('recipientAddress', address);
    }
  }, [address, setValue, watch]);

  const onSubmit = async (data: MintTicketFormData) => {
    try {
      await mintTicket(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (isConfirmed && transactionHash) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Ticket Publicado com Sucesso!
              </h2>
              <p className="text-muted-foreground">
                Seu ticket NFT foi criado na blockchain
              </p>
            </div>

            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">Transaction Hash:</p>
              <a
                href={`https://amoy.polygonscan.com/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-mono text-sm break-all"
              >
                {transactionHash}
              </a>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Publicar Outro Ticket
              </button>
              <a
                href={`https://testnets.opensea.io/account`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
              >
                Ver no OpenSea
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  if (isProcessing || steps.length > 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Processando Mint...
          </h2>

          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`
                  flex items-start gap-4 p-4 rounded-lg border-2
                  ${step.status === 'completed' ? 'bg-green-500/10 border-green-500/30' : ''}
                  ${step.status === 'in-progress' ? 'bg-blue-500/10 border-blue-500/30' : ''}
                  ${step.status === 'error' ? 'bg-red-500/10 border-red-500/30' : ''}
                  ${step.status === 'pending' ? 'bg-muted border-border' : ''}
                `}
              >
                <div className="flex-shrink-0 mt-1">
                  {step.status === 'completed' && <span className="text-2xl">✅</span>}
                  {step.status === 'in-progress' && (
                    <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {step.status === 'error' && <span className="text-2xl">❌</span>}
                  {step.status === 'pending' && <span className="text-2xl">⏱️</span>}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  {step.message && (
                    <p className="text-sm text-muted-foreground mt-1">{step.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="font-bold text-foreground">Carteira Não Conectada</h3>
              <p className="text-muted-foreground text-sm">
                Por favor, conecte sua carteira para mintar tickets NFT.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Criar Novo Ticket NFT
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-foreground mb-2">
              Nome do Evento *
            </label>
            <input
              {...register('eventName')}
              type="text"
              id="eventName"
              placeholder="Ex: Rock in Rio 2025"
              className={`
                w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-gray-500 placeholder:opacity-60
                ${errors.eventName ? 'border-red-500' : 'border-border'}
              `}
            />
            {errors.eventName && (
              <p className="mt-1 text-sm text-red-500">{errors.eventName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-foreground mb-2">
              Data do Evento *
            </label>
            <input
              {...register('eventDate')}
              type="date"
              id="eventDate"
              min={getMinDate()}
              className={`
                w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground
                ${errors.eventDate ? 'border-red-500' : 'border-border'}
              `}
            />
            {errors.eventDate && (
              <p className="mt-1 text-sm text-red-500">{errors.eventDate.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="ticketType" className="block text-sm font-medium text-foreground mb-2">
              Tipo de Ingresso *
            </label>
            <input
              {...register('ticketType')}
              type="text"
              id="ticketType"
              placeholder="Ex: VIP, Pista, Camarote"
              className={`
                w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-gray-500 placeholder:opacity-60
                ${errors.ticketType ? 'border-red-500' : 'border-border'}
              `}
            />
            {errors.ticketType && (
              <p className="mt-1 text-sm text-red-500">{errors.ticketType.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-foreground mb-2">
                Setor *
              </label>
              <input
                {...register('sector')}
                type="text"
                id="sector"
                placeholder="Ex: Pista Premium"
                className={`
                  w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-gray-500 placeholder:opacity-60
                  ${errors.sector ? 'border-red-500' : 'border-border'}
                `}
              />
              {errors.sector && (
                <p className="mt-1 text-sm text-red-500">{errors.sector.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="seat" className="block text-sm font-medium text-foreground mb-2">
                Assento *
              </label>
              <input
                {...register('seat')}
                type="text"
                id="seat"
                placeholder="Ex: A-42"
                className={`
                  w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-gray-500 placeholder:opacity-60
                  ${errors.seat ? 'border-red-500' : 'border-border'}
                `}
              />
              {errors.seat && (
                <p className="mt-1 text-sm text-red-500">{errors.seat.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="recipientAddress" className="block text-sm font-medium text-foreground mb-2">
              Endereço do Destinatário *
            </label>
            <input
              {...register('recipientAddress')}
              type="text"
              id="recipientAddress"
              placeholder="0x..."
              className={`
                w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm text-foreground placeholder:text-gray-500 placeholder:opacity-60
                ${errors.recipientAddress ? 'border-red-500' : 'border-border'}
              `}
            />
            {errors.recipientAddress && (
              <p className="mt-1 text-sm text-red-500">{errors.recipientAddress.message}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Por padrão, o ticket será enviado para sua carteira conectada
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Descrição (opcional)
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              placeholder="Informações adicionais sobre o ticket..."
              className={`
                w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-gray-500 placeholder:opacity-60
                ${errors.description ? 'border-red-500' : 'border-border'}
              `}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isProcessing}
            className={`
              w-full py-3 px-6 rounded-lg font-medium transition-colors
              ${isSubmitting || isProcessing
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90'
              } disabled:cursor-not-allowed cursor-pointer
            `}
          >
            {isSubmitting || isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              '🎫 Publicar Ticket NFT'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}


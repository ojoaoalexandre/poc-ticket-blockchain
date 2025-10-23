import { useAccount } from 'wagmi';
import { WalletConnect } from '../components/wallet';
import { TicketList } from '../components/tickets';
import { useTickets } from '../hooks/useTickets';
import { useMemo } from 'react';
import { getTicketStatus } from '../types/ticket';

export function ViewTickets() {
  const { isConnected } = useAccount();
  const { tickets, isLoading, error, refresh } = useTickets();

  const stats = useMemo(() => {
    const total = tickets.length;
    const valid = tickets.filter(t => getTicketStatus(t) === 'valid').length;
    const checkedIn = tickets.filter(t => getTicketStatus(t) === 'checked-in').length;
    const expired = tickets.filter(t => getTicketStatus(t) === 'expired').length;

    return { total, valid, checkedIn, expired };
  }, [tickets]);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between">
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-3xl">👁️</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold">
                  Meus Ingressos NFT
                </h1>
                <p className="mt-1">
                  Visualize e gerencie todos os seus ingressos digitais
                </p>
              </div>
            </div>
          </div>

          <WalletConnect />
        </div>

        {!isConnected ? (
          <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">
              Carteira Não Conectada
            </h3>
            <p className="text-muted-foreground mb-6">
              Por favor, conecte sua carteira para visualizar seus ingressos NFT.
            </p>
            <div className="inline-block">
              <WalletConnect />
            </div>
          </div>
        ) : (
          <>
            {!isLoading && tickets.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-card rounded-lg shadow p-4 border-2 border-border">
                  <div className="text-3xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total</div>
                </div>

                <div className="bg-card rounded-lg shadow p-4 border-2 border-green-500/30">
                  <div className="text-3xl font-bold text-green-500">{stats.valid}</div>
                  <div className="text-sm text-muted-foreground mt-1">Válidos</div>
                </div>

                <div className="bg-card rounded-lg shadow p-4 border-2 border-blue-500/30">
                  <div className="text-3xl font-bold text-blue-500">{stats.checkedIn}</div>
                  <div className="text-sm text-muted-foreground mt-1">Usados</div>
                </div>

                <div className="bg-card rounded-lg shadow p-4 border-2 border-border">
                  <div className="text-3xl font-bold text-muted-foreground">{stats.expired}</div>
                  <div className="text-sm text-muted-foreground mt-1">Expirados</div>
                </div>
              </div>
            )}

            <TicketList
              tickets={tickets}
              isLoading={isLoading}
              error={error}
              onRefresh={refresh}
            />
          </>
        )}
      </div>
    </div>
  );
}


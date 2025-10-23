import { http, createConfig } from 'wagmi';
import { polygonAmoy } from './chains';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

const connectors = [
  injected({
    target: 'metaMask',
  }),

  walletConnect({
    projectId,
    metadata: {
      name: 'Event Ticket NFT',
      description: 'Sistema de emissão e validação de ingressos digitais baseados em NFTs',
      url: 'https://event-ticket-nft.com',
      icons: ['https://event-ticket-nft.com/icon.png'],
    },
    showQrModal: true,
  }),
];

export const config = createConfig({
  chains: [polygonAmoy],
  connectors,
  transports: {
    [polygonAmoy.id]: http(),
  },
  ssr: false,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

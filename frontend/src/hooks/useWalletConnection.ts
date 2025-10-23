import { useConnect, useDisconnect, useAccount } from 'wagmi';

export function useWalletConnection() {
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();

  const connectMetaMask = () => {
    const metamaskConnector = connectors.find(
      (c) => c.id === 'injected' || c.name.toLowerCase().includes('metamask')
    );

    if (metamaskConnector) {
      connect({ connector: metamaskConnector });
    } else {
      console.error('MetaMask connector not found');
    }
  };

  const connectWalletConnect = () => {
    const wcConnector = connectors.find(
      (c) => c.id === 'walletConnect' || c.type === 'walletConnect'
    );

    if (wcConnector) {
      connect({ connector: wcConnector });
    } else {
      console.error('WalletConnect connector not found');
    }
  };

  const connectWithConnector = (connectorId: string) => {
    const connector = connectors.find((c) => c.id === connectorId);

    if (connector) {
      connect({ connector });
    } else {
      console.error(`Connector ${connectorId} not found`);
    }
  };

  const getErrorMessage = (): string | null => {
    if (!error) return null;

    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('user rejected')) {
      return 'Connection request was rejected';
    }
    if (errorMessage.includes('no provider')) {
      return 'Please install MetaMask to continue';
    }
    if (errorMessage.includes('chain')) {
      return 'Please switch to Polygon Amoy network';
    }

    return 'Failed to connect wallet. Please try again.';
  };

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    status,
    error,
    errorMessage: getErrorMessage(),
    connectors,
    connectMetaMask,
    connectWalletConnect,
    connectWithConnector,
    disconnect,
  };
}



import { useAccount } from 'wagmi';
import { ConnectButton } from './ConnectButton';
import { WalletInfo } from './WalletInfo';

interface WalletConnectProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  showBalance?: boolean;
  showDisconnect?: boolean;
  className?: string;
}

export function WalletConnect({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  showBalance = true,
  showDisconnect = true,
  className = '',
}: WalletConnectProps) {
  const { address, isConnected } = useAccount();

  if (isConnected && address) {
    return (
      <WalletInfo
        address={address}
        showBalance={showBalance}
        showDisconnect={showDisconnect}
        className={className}
      />
    );
  }

  return (
    <ConnectButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
    />
  );
}

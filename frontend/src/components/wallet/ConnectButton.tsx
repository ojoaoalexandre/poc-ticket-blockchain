

import { useState } from 'react';
import { Button } from '../ui/Button';
import { useWalletConnection } from '../../hooks/useWalletConnection';

interface ConnectButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function ConnectButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: ConnectButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const { isConnecting, connectMetaMask, connectWalletConnect, errorMessage } =
    useWalletConnection();

  const handleConnect = () => {
    
    connectMetaMask();
  };

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        className={className}
        onClick={handleConnect}
        isLoading={isConnecting}
        leftIcon={<WalletIcon />}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>

      {errorMessage && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-lg shadow-lg z-10">
          {errorMessage}
        </div>
      )}

      {showOptions && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
          <button
            onClick={() => {
              connectMetaMask();
              setShowOptions(false);
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
          >
            <span className="text-2xl">🦊</span>
            <div>
              <div className="font-medium">MetaMask</div>
              <div className="text-xs text-gray-500">Connect with MetaMask</div>
            </div>
          </button>

          <button
            onClick={() => {
              connectWalletConnect();
              setShowOptions(false);
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-t border-gray-100"
          >
            <span className="text-2xl">📱</span>
            <div>
              <div className="font-medium">WalletConnect</div>
              <div className="text-xs text-gray-500">Connect with mobile wallet</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

function WalletIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}

import { useState } from 'react';
import { useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { Wallet, Copy, Check, LogOut, ChevronDown } from 'lucide-react';
import { useFormattedAddress } from '../../hooks/useFormattedAddress';
import { useWalletConnection } from '../../hooks/useWalletConnection';
import { formatBalance } from '../../utils/formatters';

interface WalletInfoProps {
  address: `0x${string}`;
  showBalance?: boolean;
  showDisconnect?: boolean;
  className?: string;
}

export function WalletInfo({
  address,
  showBalance = true,
  showDisconnect = true,
  className = '',
}: WalletInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { formatted, copyAddress, copied } = useFormattedAddress(address);
  const { disconnect } = useWalletConnection();

  const { data: balance } = useBalance({
    address: address,
  });

  const formattedBalance = balance
    ? formatBalance(formatUnits(balance.value, balance.decimals), 4)
    : '0.0000';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Wallet className="w-3 h-3 text-white" />
        </div>
        <span className="font-mono text-sm text-gray-200">{formatted}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 p-3">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {address.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400">Connected</div>
                <div className="font-mono text-sm text-gray-200 truncate">{address}</div>
              </div>
            </div>

            <button
              onClick={() => {
                copyAddress();
                setTimeout(() => setIsOpen(false), 1000);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-700 rounded-md transition-colors text-sm mb-2 text-gray-200"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Address</span>
                </>
              )}
            </button>

            {showBalance && (
              <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-md mb-2">
                <div className="text-xs text-gray-400 mb-1">Balance</div>
                <div className="font-semibold text-gray-100">
                  {formattedBalance} MATIC
                </div>
              </div>
            )}

            {showDisconnect && (
              <button
                onClick={() => {
                  disconnect();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-500/10 text-red-400 rounded-md transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}


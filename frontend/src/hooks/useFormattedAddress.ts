import { useState } from 'react';
import { formatAddress, copyToClipboard } from '../utils/formatters';

export function useFormattedAddress(address: string | undefined) {
  const [copied, setCopied] = useState(false);

  const formatted = formatAddress(address);

  const copyAddress = async () => {
    if (!address) return false;

    const success = await copyToClipboard(address);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    }

    return false;
  };

  return {
    formatted,
    full: address,
    copyAddress,
    copied,
  };
}

import { format } from 'date-fns';

export function formatAddress(address: string | undefined): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(timestamp: number): string {
  return format(new Date(timestamp * 1000), 'PPP');
}

export function formatTime(timestamp: number): string {
  return format(new Date(timestamp * 1000), 'p');
}

export function formatDateTime(timestamp: number): string {
  return format(new Date(timestamp * 1000), 'PPP p');
}

export function formatTokenId(tokenId: number | bigint): string {
  return `#${tokenId.toString().padStart(4, '0')}`;
}

export function formatMATIC(value: bigint): string {
  const matic = Number(value) / 1e18;
  return `${matic.toFixed(4)} MATIC`;
}

export function truncate(str: string, maxLength: number = 50): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

export function formatBalance(
  balance: string | number,
  decimals: number = 4
): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (isNaN(num)) return '0.0000';
  return num.toFixed(decimals);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

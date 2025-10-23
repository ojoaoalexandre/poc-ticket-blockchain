import { isAddress } from 'viem';

export function isValidAddress(address: string): boolean {
  return isAddress(address);
}

export function isDateInFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

export function isValidSeatFormat(seat: string): boolean {
  return /^[A-Z0-9]+-?[A-Z0-9]*$/i.test(seat);
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidEventId(eventId: number): boolean {
  return Number.isInteger(eventId) && eventId > 0;
}

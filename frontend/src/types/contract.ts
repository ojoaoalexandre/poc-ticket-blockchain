

export const EVENT_TICKET_ABI = [
  {
    type: 'function',
    name: 'mintTicket',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'eventId', type: 'uint256' },
      { name: 'seat', type: 'string' },
      { name: 'sector', type: 'string' },
      { name: 'eventDate', type: 'uint256' },
      { name: 'tokenURI', type: 'string' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getTicketInfo',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      {
        name: 'ticket',
        type: 'tuple',
        components: [
          { name: 'eventId', type: 'uint256' },
          { name: 'seat', type: 'string' },
          { name: 'sector', type: 'string' },
          { name: 'eventDate', type: 'uint256' },
          { name: 'checkedIn', type: 'bool' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getCompleteTicketInfo',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      {
        name: 'ticket',
        type: 'tuple',
        components: [
          { name: 'eventId', type: 'uint256' },
          { name: 'seat', type: 'string' },
          { name: 'sector', type: 'string' },
          { name: 'eventDate', type: 'uint256' },
          { name: 'checkedIn', type: 'bool' },
        ],
      },
      { name: 'uri', type: 'string' },
      { name: 'owner', type: 'address' },
    ],
  },
  {
    type: 'function',
    name: 'checkIn',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'isTicketValid',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'isTicketCheckedIn',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'tokenURI',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'ownerOf',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'safeTransferFrom',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'TicketMinted',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'eventId', type: 'uint256', indexed: true },
      { name: 'seat', type: 'string', indexed: false },
      { name: 'eventDate', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'TicketCheckedIn',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
] as const;

export interface ContractConfig {
  address: `0x${string}`;
  abi: typeof EVENT_TICKET_ABI;
}

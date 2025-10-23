

import QRCode from 'qrcode';

export interface TicketData {
  eventName: string;
  eventDate: Date;
  ticketType: string;
  sector: string;
  seat: string;
  eventId: string;
  tokenId?: string; 
  contractAddress?: string; 
}

async function generateQRCode(tokenId: string, contractAddress: string): Promise<string> {
  
  const url = `https://testnets.opensea.io/assets/amoy/${contractAddress}/${tokenId}`;

  try {
    const dataURL = await QRCode.toDataURL(url, {
      width: 100,
      margin: 1,
      color: {
        dark: '#8B5CF6',  
        light: '#FFFFFF'  
      }
    });
    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==';
  }
}

const SVG_TEMPLATE = `
<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="600" fill="url(#grad)"/>

  <!-- Border -->
  <rect x="10" y="10" width="380" height="580" fill="none" stroke="white" stroke-width="2" rx="10"/>

  <!-- Title -->
  <text x="200" y="80" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">
    {{EVENT_NAME}}
  </text>
  <text x="200" y="120" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">
    {{YEAR}}
  </text>

  <!-- Ticket Type Badge -->
  <rect x="140" y="150" width="120" height="40" fill="rgba(255,255,255,0.2)" rx="5"/>
  <text x="200" y="177" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">
    {{TICKET_TYPE}}
  </text>

  <!-- Details -->
  <text x="50" y="250" font-family="Arial, sans-serif" font-size="16" fill="white" font-weight="bold">
    EVENT DETAILS
  </text>

  <text x="50" y="290" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.9)">
    Sector: {{SECTOR}}
  </text>
  <text x="50" y="320" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.9)">
    Seat: {{SEAT}}
  </text>
  <text x="50" y="350" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.9)">
    Event ID: #{{EVENT_ID}}
  </text>
  <text x="50" y="380" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.9)">
    Token ID: #{{TOKEN_ID}}
  </text>

  <!-- QR Code -->
  <rect x="150" y="420" width="100" height="100" fill="white" rx="5"/>
  <image x="150" y="420" width="100" height="100" href="{{QR_CODE_DATA_URL}}" />

  <!-- Footer -->
  <text x="200" y="560" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.7)" text-anchor="middle">
    NFT Ticket • Blockchain Verified
  </text>
</svg>
`;

export async function generateTicketImage(ticketData: TicketData): Promise<string> {
  const {
    eventName,
    eventDate,
    ticketType,
    sector,
    seat,
    eventId,
    tokenId = 'TBD',
    contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'
  } = ticketData;

  
  const year = eventDate.getFullYear().toString();

  
  const qrCodeDataURL = await generateQRCode(tokenId, contractAddress);

  
  const svg = SVG_TEMPLATE
    .replace('{{EVENT_NAME}}', escapeXml(eventName))
    .replace('{{YEAR}}', year)
    .replace('{{TICKET_TYPE}}', escapeXml(ticketType))
    .replace('{{SECTOR}}', escapeXml(sector))
    .replace('{{SEAT}}', escapeXml(seat))
    .replace('{{EVENT_ID}}', escapeXml(eventId))
    .replace('{{TOKEN_ID}}', escapeXml(tokenId))
    .replace('{{QR_CODE_DATA_URL}}', qrCodeDataURL);

  return svg;
}

export async function generateTicketBlob(ticketData: TicketData): Promise<Blob> {
  const svg = await generateTicketImage(ticketData);
  return new Blob([svg], { type: 'image/svg+xml' });
}

export async function generateTicketFile(
  ticketData: TicketData,
  filename?: string
): Promise<File> {
  const blob = await generateTicketBlob(ticketData);
  const name = filename || `ticket-${ticketData.eventId}-${Date.now()}.svg`;
  return new File([blob], name, { type: 'image/svg+xml' });
}

export async function generateTicketPreview(ticketData: TicketData): Promise<string> {
  const svg = await generateTicketImage(ticketData);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function formatEventDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}


import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface EventData {
  eventName: string;
  year: string;
  ticketType: string;
  sector: string;
  seat: string;
  eventId: string | number;
  tokenId: string | number;
  contractAddress?: string;
}

async function generateQRCode(tokenId: string | number, contractAddress: string): Promise<string> {
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
    throw error;
  }
}

async function generateTicketImage(eventData: EventData): Promise<string> {
  const {
    eventName,
    year,
    ticketType,
    sector,
    seat,
    eventId,
    tokenId,
    contractAddress = '0x0000000000000000000000000000000000000000'
  } = eventData;

  const templatePath = path.join(__dirname, '../assets/tickets/templates/ticket-template.svg');
  let template: string;

  try {
    template = fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error('Error reading template:', error);
    throw error;
  }

  const qrCodeDataURL = await generateQRCode(tokenId, contractAddress);

  const svg = template
    .replace('{{EVENT_NAME}}', eventName)
    .replace('{{YEAR}}', year)
    .replace('{{TICKET_TYPE}}', ticketType)
    .replace('{{SECTOR}}', sector)
    .replace('{{SEAT}}', seat)
    .replace('{{EVENT_ID}}', String(eventId))
    .replace('{{TOKEN_ID}}', String(tokenId))
    .replace('{{QR_CODE_DATA_URL}}', qrCodeDataURL);

  return svg;
}

function saveTicketImage(svg: string, filename: string): string {
  const outputDir = path.join(__dirname, '../assets/tickets/examples');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, svg, 'utf8');

  return outputPath;
}

async function generateAndSaveTicket(eventData: EventData, filename: string): Promise<string> {
  const svg = await generateTicketImage(eventData);
  const savedPath = saveTicketImage(svg, filename);
  console.log(`✅ Ticket saved: ${savedPath}`);
  return savedPath;
}

export {
  generateQRCode,
  generateTicketImage,
  saveTicketImage,
  generateAndSaveTicket
};

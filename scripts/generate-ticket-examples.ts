import { generateAndSaveTicket } from '../utils/ticketImageGenerator';

const sampleEvents = [
  {
    eventName: 'ROCK FESTIVAL',
    year: '2025',
    ticketType: 'VIP TICKET',
    sector: 'VIP',
    seat: 'A35',
    eventId: '001',
    tokenId: '1001',
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  },
  {
    eventName: 'TECH CONFERENCE',
    year: '2025',
    ticketType: 'REGULAR',
    sector: 'B',
    seat: '102',
    eventId: '002',
    tokenId: '1002',
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  },
  {
    eventName: 'SHAKESPEARE THEATER',
    year: '2025',
    ticketType: 'PREMIUM',
    sector: 'Balcony',
    seat: 'C12',
    eventId: '003',
    tokenId: '1003',
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  },
  {
    eventName: 'CHAMPIONS LEAGUE',
    year: '2025',
    ticketType: 'VIP TICKET',
    sector: 'North',
    seat: 'A7',
    eventId: '004',
    tokenId: '1004',
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  },
  {
    eventName: 'ART EXHIBITION',
    year: '2025',
    ticketType: 'GENERAL',
    sector: 'Main Hall',
    seat: 'Open',
    eventId: '005',
    tokenId: '1005',
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  }
];

async function generateExamples() {
  console.log('🎫 Starting ticket generation...\n');

  try {
    for (let i = 0; i < sampleEvents.length; i++) {
      const event = sampleEvents[i];
      const filename = `ticket-${event.eventName.toLowerCase().replace(/\s+/g, '-')}.svg`;

      console.log(`Generating ${i + 1}/${sampleEvents.length}: ${event.eventName}...`);
      await generateAndSaveTicket(event, filename);
    }

    console.log('\n✅ All tickets generated successfully!');
    console.log(`📁 Output directory: assets/tickets/examples/`);
  } catch (error) {
    console.error('❌ Error generating tickets:', error);
    process.exit(1);
  }
}

generateExamples();


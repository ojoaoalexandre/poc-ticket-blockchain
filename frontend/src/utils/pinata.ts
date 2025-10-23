export interface PinataUploadResult {
  cid: string;
  uri: string;
  gatewayUrl: string;
}

export interface TicketPinataResult {
  imageCID: string;
  imageURI: string;
  imageGatewayURL: string;
  metadataCID: string;
  tokenURI: string;
  metadataGatewayURL: string;
}

export class PinataUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PinataUploadError';
  }
}

export class PinataAPIError extends PinataUploadError {
  constructor(message: string) {
    super(`Pinata API error: ${message}`);
    this.name = 'PinataAPIError';
  }
}

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

function getPinataJWT(): string {
  const jwt = import.meta.env.VITE_PINATA_JWT;

  if (!jwt) {
    throw new PinataAPIError(
      'VITE_PINATA_JWT not found in environment variables. ' +
      'Please set it in your .env file.'
    );
  }

  return jwt;
}

export function formatIPFSUri(cid: string): string {
  return `ipfs://${cid}`;
}

export function getGatewayUrl(cid: string, gateway?: string): string {
  const baseGateway = gateway || PINATA_GATEWAY;
  return `${baseGateway}${cid}`;
}

export async function uploadFile(
  file: File | Blob,
  options?: { name?: string; keyvalues?: Record<string, string> }
): Promise<PinataUploadResult> {
  try {
    const jwt = getPinataJWT();

    const formData = new FormData();

    if (file instanceof File) {
      formData.append('file', file);
    } else {
      const fileName = options?.name || 'file';
      formData.append('file', file, fileName);
    }

    const metadata = {
      name: options?.name || (file instanceof File ? file.name : 'file'),
      keyvalues: options?.keyvalues || {}
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    formData.append('pinataOptions', JSON.stringify({
      cidVersion: 1
    }));

    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new PinataAPIError(`Upload failed: ${error}`);
    }

    const data = await response.json();
    const cid = data.IpfsHash;

    return {
      cid,
      uri: formatIPFSUri(cid),
      gatewayUrl: getGatewayUrl(cid)
    };
  } catch (error) {
    if (error instanceof PinataUploadError) {
      throw error;
    }
    throw new PinataAPIError(
      error instanceof Error ? error.message : 'Upload failed'
    );
  }
}

export async function uploadJSON(
  metadata: object,
  name?: string
): Promise<PinataUploadResult> {
  try {
    const jwt = getPinataJWT();

    const body = {
      pinataContent: metadata,
      pinataMetadata: {
        name: name || 'metadata.json'
      },
      pinataOptions: {
        cidVersion: 1
      }
    };

    const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new PinataAPIError(`JSON upload failed: ${error}`);
    }

    const data = await response.json();
    const cid = data.IpfsHash;

    return {
      cid,
      uri: formatIPFSUri(cid),
      gatewayUrl: getGatewayUrl(cid)
    };
  } catch (error) {
    if (error instanceof PinataUploadError) {
      throw error;
    }
    throw new PinataAPIError(
      error instanceof Error ? error.message : 'JSON upload failed'
    );
  }
}

export async function uploadTicketToIPFS(
  imageFile: File | Blob,
  metadata: any,
  ticketName?: string
): Promise<TicketPinataResult> {
  try {
    console.log('🎫 Starting ticket upload to IPFS via Pinata...');

    console.log('Step 1/2: Uploading image...');
    const imageResult = await uploadFile(imageFile, {
      name: ticketName ? `${ticketName}-image` : undefined,
      keyvalues: {
        type: 'ticket-image',
        ticket: ticketName || 'unknown'
      }
    });

    console.log('✅ Image uploaded successfully!');
    console.log('   CID:', imageResult.cid);

    console.log('Step 2/2: Uploading metadata...');
    const updatedMetadata = {
      ...metadata,
      image: imageResult.uri
    };

    const metadataResult = await uploadJSON(
      updatedMetadata,
      ticketName ? `${ticketName}-metadata` : undefined
    );

    console.log('✅ Metadata uploaded successfully!');
    console.log('   CID:', metadataResult.cid);
    console.log('🎉 Complete ticket uploaded to IPFS!');

    return {
      imageCID: imageResult.cid,
      imageURI: imageResult.uri,
      imageGatewayURL: imageResult.gatewayUrl,
      metadataCID: metadataResult.cid,
      tokenURI: metadataResult.uri,
      metadataGatewayURL: metadataResult.gatewayUrl
    };
  } catch (error) {
    if (error instanceof PinataUploadError) {
      throw error;
    }
    throw new PinataAPIError(
      error instanceof Error ? error.message : 'Ticket upload failed'
    );
  }
}

import { PinataSDK, uploadFile as pinataUploadFile, uploadJson as pinataUploadJson } from "pinata";
import fs from 'fs';
import path from 'path';

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

export class FileNotFoundError extends PinataUploadError {
  constructor(filePath: string) {
    super(`File not found: ${filePath}`);
    this.name = 'FileNotFoundError';
  }
}

export class InvalidFileTypeError extends PinataUploadError {
  constructor(extension: string, allowed: string[]) {
    super(`Invalid file type: ${extension}. Allowed: ${allowed.join(', ')}`);
    this.name = 'InvalidFileTypeError';
  }
}

export class FileSizeTooLargeError extends PinataUploadError {
  constructor(size: number, maxSize: number) {
    super(`File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${maxSize}MB`);
    this.name = 'FileSizeTooLargeError';
  }
}

export class PinataAPIError extends PinataUploadError {
  constructor(message: string) {
    super(`Pinata API error: ${message}`);
    this.name = 'PinataAPIError';
  }
}

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
const DEFAULT_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function initPinataClient(): PinataSDK {
  const jwt = process.env.PINATA_JWT;

  if (!jwt) {
    throw new PinataAPIError(
      'PINATA_JWT not found in environment variables. ' +
      'Please set it in your .env file. Get your JWT at https://app.pinata.cloud/developers/api-keys'
    );
  }

  return new PinataSDK({
    pinataJwt: jwt
  });
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

export function formatIPFSUri(cid: string): string {
  return `ipfs://${cid}`;
}

export function getGatewayUrl(cid: string, gateway?: string): string {
  const baseGateway = gateway || DEFAULT_GATEWAY;
  return `${baseGateway}${cid}`;
}

function validateFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    throw new FileNotFoundError(filePath);
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    throw new InvalidFileTypeError(ext, ALLOWED_IMAGE_EXTENSIONS);
  }

  const stats = fs.statSync(filePath);
  if (stats.size > MAX_FILE_SIZE) {
    throw new FileSizeTooLargeError(stats.size, MAX_FILE_SIZE / 1024 / 1024);
  }
}

export async function verifyPinataKey(): Promise<boolean> {
  try {
    const pinata = initPinataClient();

    const testFile = new File(["test"], "test.txt", { type: "text/plain" });
    await pinataUploadFile(pinata.config, testFile, "public");

    return true;
  } catch (error) {
    if (error instanceof PinataAPIError) {
      throw error;
    }
    throw new PinataAPIError(
      error instanceof Error ? error.message : 'Failed to verify credentials'
    );
  }
}

export async function uploadFile(
  filePath: string,
  options?: { name?: string; keyvalues?: Record<string, string> }
): Promise<PinataUploadResult> {
  try {
    validateFile(filePath);

    const pinata = initPinataClient();

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = options?.name || path.basename(filePath);
    const mimeType = getMimeType(filePath);

    const file = new File([fileBuffer], fileName, {
      type: mimeType
    });

    const result = await pinataUploadFile(pinata.config, file, "public", {
      metadata: {
        name: fileName,
        keyvalues: options?.keyvalues
      }
    });

    const cid = result.cid;

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
    const pinata = initPinataClient();

    const result = await pinataUploadJson(pinata.config, metadata, "public", {
      metadata: {
        name: name || 'metadata.json'
      }
    });

    const cid = result.cid;

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
  imagePath: string,
  metadata: any,
  ticketName?: string
): Promise<TicketPinataResult> {
  try {
    console.log('\n🎫 Starting ticket upload to IPFS via Pinata...\n');

    console.log('Step 1/2: Uploading image...');
    console.log(`📤 Uploading image: ${imagePath}`);

    const stats = fs.statSync(imagePath);
    console.log(`   File size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   MIME type: ${getMimeType(imagePath)}`);

    const imageResult = await uploadFile(imagePath, {
      name: ticketName ? `${ticketName}-image` : undefined,
      keyvalues: {
        type: 'ticket-image',
        ticket: ticketName || 'unknown'
      }
    });

    console.log(`✅ Image uploaded successfully!`);
    console.log(`   CID: ${imageResult.cid}`);
    console.log(`   Gateway: ${imageResult.gatewayUrl}\n`);

    console.log('Step 2/2: Uploading metadata...');
    const updatedMetadata = {
      ...metadata,
      image: imageResult.uri
    };

    const metadataResult = await uploadJSON(
      updatedMetadata,
      ticketName ? `${ticketName}-metadata` : undefined
    );

    console.log(`✅ Metadata uploaded successfully!`);
    console.log(`   CID: ${metadataResult.cid}`);
    console.log(`   Gateway: ${metadataResult.gatewayUrl}\n`);

    console.log('🎉 Complete ticket uploaded to IPFS!\n');

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

export { uploadTicketToIPFS as uploadTicketToIPFSViaLegacy };

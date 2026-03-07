import { Injectable } from '@angular/core';
import * as QRCode from 'qrcode';
import * as CryptoJS from 'crypto-js';
import * as pako from 'pako';
import { Buffer } from 'buffer';

export interface MemberQRData {
  entryId: string;
  van: string;
  noemNaam: string;
  lidNommer?: string;
  reddingsVerwysing?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QRService {
  private readonly encryptionKey = 'suidlanders-emergency-data'; // This should be configurable in production
  private readonly currentVersion = '1.0.0'; // Data format version

  constructor() {}

  private calculateChecksum(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  private wrapWithMetadata(data: any): any {
    return {
      version: this.currentVersion,
      timestamp: new Date().toISOString(),
      checksum: this.calculateChecksum(JSON.stringify(data)),
      data
    };
  }

  private validateData(wrappedData: any): boolean {
    const { version, data, checksum } = wrappedData;
    
    // Version check
    if (!version || version !== this.currentVersion) {
      throw new Error(`Incompatible data version: ${version}`);
    }

    // Checksum validation
    const calculatedChecksum = this.calculateChecksum(JSON.stringify(data));
    if (calculatedChecksum !== checksum) {
      throw new Error('Data integrity check failed');
    }

    return true;
  }

  async generateQRCode(data: any): Promise<string> {
    try {
      // Convert data to JSON string
      const jsonData = JSON.stringify(data);

      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(jsonData, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      return qrDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate camp provisioning QR code (for reception dashboard)
   * Returns data URL for display
   *
   * @param payload QR payload with serverUrls, syncCode, campId
   * @returns Data URL of generated QR code
   */
  async generateCampProvisioningQR(payload: any): Promise<string> {
    try {
      // Convert payload to JSON string (minified for compact QR)
      const jsonData = JSON.stringify(payload);

      // Generate QR code as data URL with larger size for scanning
      const qrDataUrl = await QRCode.toDataURL(jsonData, {
        errorCorrectionLevel: 'M', // Medium error correction (balance between size and reliability)
        margin: 4,
        width: 400, // Larger for display on monitor
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      return qrDataUrl;
    } catch (error) {
      console.error('Error generating camp provisioning QR code:', error);
      throw new Error('Failed to generate camp provisioning QR code');
    }
  }

  async decodeQRCode(qrData: string): Promise<any> {
    try {
      return JSON.parse(qrData);
    } catch (error) {
      console.error('Error decoding QR code:', error);
      throw new Error('Failed to decode QR code');
    }
  }

  private isValidMemberQRData(data: any): data is MemberQRData {
    return (
      typeof data === 'object' &&
      typeof data.entryId === 'string' &&
      typeof data.van === 'string' &&
      typeof data.noemNaam === 'string' &&
      (data.lidNommer === undefined || typeof data.lidNommer === 'string') &&
      (data.reddingsVerwysing === undefined || typeof data.reddingsVerwysing === 'string')
    );
  }

  // Helper method to split data into multiple QR codes if needed
  async generateMultipleQRCodes(data: any, maxChunkSize: number = 1000): Promise<string[]> {
    try {
      // Wrap data with metadata
      const wrappedData = this.wrapWithMetadata(data);
      
      // Convert to JSON and compress
      const jsonData = JSON.stringify(wrappedData);
      const compressed = pako.deflate(jsonData);
      
      // Convert to base64
      const base64Data = Buffer.from(compressed).toString('base64');
      
      // Split into chunks
      const chunks = this.chunkString(base64Data, maxChunkSize);
      const totalChunks = chunks.length;
      
      // Generate QR code for each chunk with metadata
      const qrCodes = await Promise.all(chunks.map(async (chunk, index) => {
        const chunkData = {
          version: this.currentVersion,
          part: index + 1,
          total: totalChunks,
          checksum: this.calculateChecksum(chunk),
          data: chunk
        };
        
        const encrypted = CryptoJS.AES.encrypt(
          JSON.stringify(chunkData),
          this.encryptionKey
        ).toString();
        
        return QRCode.toDataURL(encrypted, {
          errorCorrectionLevel: 'H',
          margin: 1,
          scale: 8,
          width: 400
        });
      }));
      
      return qrCodes;
    } catch (error) {
      console.error('Error generating multiple QR codes:', error);
      throw error;
    }
  }

  // Helper method to combine multiple QR code data
  async combineQRCodes(qrDataArray: string[]): Promise<any> {
    try {
      // Decrypt and parse each chunk
      const chunks = await Promise.all(qrDataArray.map(async (qrData) => {
        const decrypted = CryptoJS.AES.decrypt(qrData, this.encryptionKey)
          .toString(CryptoJS.enc.Utf8);
        const chunkData = JSON.parse(decrypted);
        
        // Validate chunk version
        if (chunkData.version !== this.currentVersion) {
          throw new Error(`Incompatible chunk version: ${chunkData.version}`);
        }
        
        // Validate chunk checksum
        if (this.calculateChecksum(chunkData.data) !== chunkData.checksum) {
          throw new Error(`Chunk ${chunkData.part} integrity check failed`);
        }
        
        return chunkData;
      }));
      
      // Sort chunks by part number
      chunks.sort((a, b) => a.part - b.part);
      
      // Validate all parts are present and sequential
      if (chunks.some((chunk, index) => 
        chunk.part !== index + 1 || 
        chunk.total !== chunks.length
      )) {
        throw new Error('Missing or invalid QR code parts');
      }
      
      // Combine data
      const combinedBase64 = chunks.map(chunk => chunk.data).join('');
      
      // Decompress and parse
      const compressed = Buffer.from(combinedBase64, 'base64');
      const decompressed = pako.inflate(compressed, { to: 'string' });
      const wrappedData = JSON.parse(decompressed);
      
      // Validate final data
      if (this.validateData(wrappedData)) {
        return wrappedData.data;
      }
    } catch (error) {
      console.error('Error combining QR codes:', error);
      throw error;
    }
  }

  private chunkString(str: string, size: number): string[] {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
      chunks.push(str.slice(i, i + size));
    }
    return chunks;
  }
} 
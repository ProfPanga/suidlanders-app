import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as os from 'os';

/**
 * QR Payload for camp provisioning
 */
export interface QRPayload {
  serverUrls: string[];
  syncCode: string;
  campId: string;
}

/**
 * Sync token exchange result
 */
export interface SyncTokenResult {
  syncToken: string;
  expiresIn: number; // seconds
}

/**
 * Camp Auth Service - Handles QR generation and token exchange
 *
 * Story 1.3: QR Code Provisioning Flow
 */
@Injectable()
export class CampAuthService {
  // In-memory storage for sync codes (in production, use Redis or database)
  private syncCodes = new Map<string, { campId: string; createdAt: Date }>();

  // Sync code expiry: 15 minutes
  private readonly SYNC_CODE_EXPIRY_MS = 15 * 60 * 1000;

  // Sync token expiry: 1 hour
  private readonly SYNC_TOKEN_EXPIRY_SECONDS = 3600;

  /**
   * Generate QR payload for camp provisioning
   * Creates a short-lived sync code and returns server URLs
   *
   * @param campId Camp identifier
   * @returns QR payload with server URLs, sync code, and camp ID
   */
  async generateQRPayload(campId: string): Promise<QRPayload> {
    // Generate random sync code (8 characters, alphanumeric)
    const syncCode = this.generateSyncCode();

    // Store sync code with expiry
    this.syncCodes.set(syncCode, {
      campId,
      createdAt: new Date(),
    });

    // Get all server URLs (multiple interfaces for Pi)
    const serverUrls = this.getServerURLs();

    return {
      serverUrls,
      syncCode,
      campId,
    };
  }

  /**
   * Exchange sync code for temporary sync token
   *
   * @param syncCode Short-lived sync code from QR
   * @param campId Camp identifier
   * @returns Sync token and expiry time
   */
  async exchangeSyncCode(
    syncCode: string,
    campId: string
  ): Promise<SyncTokenResult | null> {
    // Check if sync code exists
    const storedCode = this.syncCodes.get(syncCode);

    if (!storedCode) {
      return null; // Invalid sync code
    }

    // Verify camp ID matches
    if (storedCode.campId !== campId) {
      return null; // Camp ID mismatch
    }

    // Check if sync code has expired
    const now = new Date();
    const age = now.getTime() - storedCode.createdAt.getTime();

    if (age > this.SYNC_CODE_EXPIRY_MS) {
      // Clean up expired code
      this.syncCodes.delete(syncCode);
      return null; // Expired sync code
    }

    // Generate temporary sync token (JWT-like, but simplified for MVP)
    const syncToken = this.generateSyncToken(campId);

    // One-time use: delete sync code after exchange
    this.syncCodes.delete(syncCode);

    return {
      syncToken,
      expiresIn: this.SYNC_TOKEN_EXPIRY_SECONDS,
    };
  }

  /**
   * Generate random sync code
   * 8 characters, alphanumeric, uppercase for easy reading
   *
   * @returns Random sync code (e.g., "A7B2C9D4")
   */
  private generateSyncCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < 8; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      code += chars[randomIndex];
    }

    return code;
  }

  /**
   * Generate temporary sync token
   * In production, use proper JWT with signing
   *
   * @param campId Camp identifier
   * @returns Sync token
   */
  private generateSyncToken(campId: string): string {
    // For MVP: Simple token (in production, use JWT with secret signing)
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    return `SYNC_${campId}_${timestamp}_${random}`;
  }

  /**
   * Get all server URLs for QR code
   * Returns multiple URLs to handle different network interfaces
   *
   * For Raspberry Pi deployment:
   * - Ethernet IP (e.g., 192.168.1.150)
   * - WiFi AP IP (e.g., 192.168.4.1)
   * - mDNS hostname (e.g., camp.local)
   *
   * @returns Array of server URLs
   */
  private getServerURLs(): string[] {
    const port = process.env.PORT || 3000;
    const urls: string[] = [];

    // Get all network interfaces
    const interfaces = os.networkInterfaces();

    // Collect all IPv4 addresses (exclude localhost)
    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (!iface) continue;

      for (const alias of iface) {
        if (alias.family === 'IPv4' && !alias.internal) {
          urls.push(`http://${alias.address}:${port}`);
        }
      }
    }

    // Add mDNS hostname if available (common for Pi)
    // In production, detect actual hostname
    urls.push(`http://camp.local:${port}`);

    // Fallback: localhost (for development)
    if (urls.length === 0) {
      urls.push(`http://localhost:${port}`);
    }

    return urls;
  }

  /**
   * Cleanup expired sync codes (run periodically)
   * In production, use a cron job or background task
   */
  cleanupExpiredCodes(): void {
    const now = new Date();

    for (const [code, data] of this.syncCodes.entries()) {
      const age = now.getTime() - data.createdAt.getTime();

      if (age > this.SYNC_CODE_EXPIRY_MS) {
        this.syncCodes.delete(code);
      }
    }
  }
}

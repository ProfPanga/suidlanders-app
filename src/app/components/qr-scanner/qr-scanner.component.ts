import { Component, EventEmitter, Output } from '@angular/core';
import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning';
import { QRPayload } from '../../models/qr-payload.model';
import { AlertController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss'],
  standalone: true,
})
export class QRScannerComponent {
  @Output() scanned = new EventEmitter<QRPayload>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() error = new EventEmitter<string>();

  constructor(
    private alertController: AlertController,
    private platform: Platform
  ) {}

  /**
   * Start the QR code scanner
   * Requests camera permission and initiates ML Kit barcode scanning
   */
  async scanQRCode(): Promise<void> {
    try {
      // Check if platform supports camera (mobile only)
      if (!this.platform.is('capacitor')) {
        await this.showError(
          'QR skandering is slegs beskikbaar op mobiele toestelle'
        );
        this.error.emit('Platform not supported');
        return;
      }

      // Request camera permission
      const permissionResult = await BarcodeScanner.requestPermissions();

      // Check if permission was not granted
      if (permissionResult.camera !== 'granted') {
        await this.showPermissionDeniedError();
        this.error.emit('Camera permission denied');
        return;
      }

      // Add scanner-active class for transparent background
      document.body.classList.add('scanner-active');

      // Start scanning
      const result = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      // Remove scanner-active class
      document.body.classList.remove('scanner-active');

      // Check if scan was cancelled
      if (!result.barcodes || result.barcodes.length === 0) {
        this.cancelled.emit();
        return;
      }

      // Parse the first QR code found
      const rawValue = result.barcodes[0].rawValue;
      if (!rawValue) {
        await this.showError('QR kode is leeg');
        this.error.emit('Empty QR code');
        return;
      }

      // Parse and validate QR payload
      const payload = this.parseQRPayload(rawValue);
      if (payload) {
        this.scanned.emit(payload);
      } else {
        await this.showError(
          'Ongeldige QR kode. Vra kamp personeel vir nuwe QR.'
        );
        this.error.emit('Invalid QR payload');
      }
    } catch (err: any) {
      // Remove scanner-active class on error
      document.body.classList.remove('scanner-active');

      console.error('QR scan failed:', err);
      await this.showError('Skandering het misluk. Probeer asseblief weer.');
      this.error.emit(err.message || 'Unknown error');
    }
  }

  /**
   * Stop the QR code scanner (if active)
   */
  async stopScanning(): Promise<void> {
    try {
      await BarcodeScanner.stopScan();
      document.body.classList.remove('scanner-active');
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  }

  /**
   * Parse and validate QR code payload
   * @param rawValue The raw QR code string
   * @returns Parsed QR payload or null if invalid
   */
  private parseQRPayload(rawValue: string): QRPayload | null {
    try {
      // Trim whitespace
      const trimmed = rawValue.trim();

      // Parse JSON
      const payload = JSON.parse(trimmed);

      // Validate required fields
      if (!this.isValidQRPayload(payload)) {
        console.error('Invalid QR payload structure:', payload);
        return null;
      }

      return payload as QRPayload;
    } catch (err) {
      console.error('Failed to parse QR payload:', err);
      return null;
    }
  }

  /**
   * Type guard to validate QR payload structure
   * @param payload The parsed JSON object
   * @returns True if payload has all required fields
   */
  private isValidQRPayload(payload: any): payload is QRPayload {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      Array.isArray(payload.serverUrls) &&
      payload.serverUrls.length > 0 &&
      payload.serverUrls.every((url: any) => typeof url === 'string') &&
      typeof payload.syncCode === 'string' &&
      payload.syncCode.length > 0 &&
      typeof payload.campId === 'string' &&
      payload.campId.length > 0
    );
  }

  /**
   * Show camera permission denied error dialog
   */
  private async showPermissionDeniedError(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Kamera Toegang Geweier',
      message:
        'Die app het kamera toegang nodig om QR kodes te skandeer. Gee asseblief toestemming in toestel instellings.',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
        },
      ],
    });

    await alert.present();
  }

  /**
   * Show generic error dialog
   * @param message Error message in Afrikaans
   */
  private async showError(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Fout',
      message,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
        },
      ],
    });

    await alert.present();
  }
} 
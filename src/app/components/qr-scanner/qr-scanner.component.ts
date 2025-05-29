import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { Result } from '@zxing/library';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-qr-scanner',
  template: `
    <div class="scanner-container">
      <video #videoElement class="scanner-preview"></video>
      <div class="scanner-overlay">
        <div class="scanner-frame"></div>
      </div>
      <div class="scanner-status" *ngIf="status">{{ status }}</div>
    </div>
  `,
  styles: [`
    .scanner-container {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 300px;
      background: #000;
      overflow: hidden;
    }
    
    .scanner-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .scanner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .scanner-frame {
      width: 250px;
      height: 250px;
      border: 2px solid #fff;
      border-radius: 12px;
      box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.3);
    }
    
    .scanner-status {
      position: absolute;
      bottom: 20px;
      left: 0;
      right: 0;
      text-align: center;
      color: #fff;
      background: rgba(0, 0, 0, 0.7);
      padding: 8px;
      font-size: 14px;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class QRScannerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @Output() scanComplete = new EventEmitter<string>();
  @Output() scanError = new EventEmitter<string>();

  private codeReader: BrowserQRCodeReader;
  private selectedDeviceId: string | undefined;
  private controls: IScannerControls | undefined;
  status: string = '';

  constructor(private platform: Platform) {
    this.codeReader = new BrowserQRCodeReader();
  }

  async ngOnInit() {
    if (this.platform.is('hybrid')) {
      this.status = 'Native camera access not implemented yet';
      this.scanError.emit(this.status);
      return;
    }

    try {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support camera access');
      }

      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });

      const devices = await BrowserQRCodeReader.listVideoInputDevices();
      
      if (!devices || devices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Try to find the back camera
      this.selectedDeviceId = devices.find((device: MediaDeviceInfo) => 
        device.label.toLowerCase().includes('back'))?.deviceId || devices[0]?.deviceId;

      if (!this.selectedDeviceId) {
        throw new Error('No camera found');
      }

      await this.startScanning();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error accessing camera';
      console.error('Error initializing scanner:', err);
      this.status = errorMessage;
      this.scanError.emit(errorMessage);
    }
  }

  async startScanning() {
    try {
      this.status = 'Starting scanner...';

      this.controls = await this.codeReader.decodeFromVideoDevice(
        this.selectedDeviceId,
        this.videoElement.nativeElement,
        (result: Result | undefined) => {
          if (result) {
            this.handleScanResult(result);
          }
        }
      );

      this.status = 'Scanner ready';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start scanner';
      console.error('Error starting scanner:', err);
      this.status = errorMessage;
      this.scanError.emit(errorMessage);
    }
  }

  private handleScanResult(result: Result) {
    const text = result.getText();
    this.status = 'QR Code detected!';
    this.scanComplete.emit(text);
  }

  ngOnDestroy() {
    if (this.controls) {
      try {
        this.controls.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  }
} 
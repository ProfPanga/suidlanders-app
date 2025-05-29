import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { QRService, MemberQRData } from '../../services/qr.service';

@Component({
  selector: 'app-qr-generator',
  template: `
    <div class="qr-container">
      <img 
        *ngIf="qrDataUrl" 
        [src]="qrDataUrl" 
        [alt]="'QR Code for ' + memberData?.noemNaam"
        #qrImage
      >
      <div *ngIf="error" class="error-message">{{ error }}</div>
      
      <ion-button 
        *ngIf="qrDataUrl"
        (click)="downloadQRCode()"
        class="download-button"
        fill="solid"
        color="primary"
      >
        <ion-icon name="download-outline" slot="start"></ion-icon>
        Stoor QR Kode
      </ion-button>
    </div>
  `,
  styles: [`
    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    img {
      max-width: 300px;
      width: 100%;
      height: auto;
      margin-bottom: 1rem;
    }

    .error-message {
      color: var(--ion-color-danger);
      margin-top: 1rem;
      text-align: center;
    }

    .download-button {
      margin-top: 1rem;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class QRGeneratorComponent implements OnChanges {
  @Input() memberData?: MemberQRData;
  
  qrDataUrl: string | null = null;
  error: string | null = null;

  constructor(private qrService: QRService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['memberData'] && this.memberData) {
      this.generateQRCode();
    }
  }

  private async generateQRCode() {
    if (!this.memberData) {
      this.error = 'No member data provided';
      return;
    }

    try {
      this.qrDataUrl = await this.qrService.generateQRCode(this.memberData);
      this.error = null;
    } catch (err) {
      console.error('Error generating QR code:', err);
      this.error = 'Could not generate QR code';
      this.qrDataUrl = null;
    }
  }

  downloadQRCode() {
    if (!this.qrDataUrl || !this.memberData) {
      return;
    }

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = this.qrDataUrl;
    
    // Generate filename using member's details
    const filename = `QR-${this.memberData.van}-${this.memberData.noemNaam}-${this.memberData.lidNommer || 'no-number'}.png`;
    
    // Clean the filename by removing special characters and spaces
    const cleanFilename = filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
    
    link.download = cleanFilename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
} 
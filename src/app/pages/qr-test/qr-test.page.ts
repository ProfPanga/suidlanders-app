import { Component } from '@angular/core';
import { QRService } from '../../services/qr.service';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent 
} from '@ionic/angular/standalone';
import { QRScannerComponent } from '../../components/qr-scanner/qr-scanner.component';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-qr-test',
  template: `
    <app-header title="QR Code Scanner Test"></app-header>

    <ion-content>
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-card>
              <ion-card-header>
                <ion-card-title>QR Code Scanner</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <app-qr-scanner
                  (scanComplete)="onScanComplete($event)"
                  (scanError)="onScanError($event)">
                </app-qr-scanner>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <ion-row *ngIf="scannedData">
          <ion-col>
            <ion-card>
              <ion-card-header>
                <ion-card-title>Scanned Data</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <pre>{{ scannedData | json }}</pre>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <ion-row *ngIf="error">
          <ion-col>
            <ion-card color="danger">
              <ion-card-header>
                <ion-card-title>Error</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                {{ error }}
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  `,
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    QRScannerComponent,
    HeaderComponent
  ]
})
export class QRTestPage {
  scannedData: any;
  error: string | null = null;

  constructor(private qrService: QRService) {}

  async onScanComplete(qrData: string) {
    try {
      this.error = null;
      this.scannedData = await this.qrService.decodeQRCode(qrData);
    } catch (err) {
      console.error('Error decoding QR data:', err);
      this.error = 'Failed to decode QR code data';
    }
  }

  onScanError(error: string) {
    this.error = error;
    this.scannedData = null;
  }
} 
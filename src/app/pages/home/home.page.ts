import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personAdd,
  documentText,
  qrCode,
  settings,
  logIn,
  sync,
} from 'ionicons/icons';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { SyncService } from '../../services/sync.service';
import { DatabaseService } from '../../services/database.service';
import { QRProvisioningService } from '../../services/qr-provisioning.service';
import { QRScannerComponent } from '../../components/qr-scanner/qr-scanner.component';

@Component({
  selector: 'app-home',
  template: `
    <app-header title="Suidlanders"></app-header>

    <ion-content class="ion-padding">
      <!-- Data Status Card (staff only) -->
      <ion-card *ngIf="isStaff && entryCount !== null">
        <ion-card-header>
          <ion-card-title>Data Status</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>
            Totale lede geregistreer: <strong>{{ entryCount }}</strong>
          </p>
          <ion-button fill="clear" (click)="refreshDataCount()">
            <ion-icon name="refresh" slot="start"></ion-icon>
            Herlaai
          </ion-button>
        </ion-card-content>
      </ion-card>

      <ion-grid>
        <ion-row>
          <ion-col size="12" size-md="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Lid Inligting</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>Voltooi of opdateer jou persoonlike inligting.</p>
                <ion-button expand="block" (click)="navigateToMemberForm()">
                  <ion-icon name="person-add" slot="start"></ion-icon>
                  {{
                    isStaff
                      ? 'Begin Registrasie'
                      : hasMemberProfile
                      ? 'Opdateer Lid Inligting'
                      : 'Voltooi Lid Inligting'
                  }}
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Personeel Aanmelding</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>Meld aan as personeel.</p>
                <ion-button
                  expand="block"
                  color="warning"
                  (click)="navigateToLogin()"
                >
                  <ion-icon name="log-in" slot="start"></ion-icon>
                  Personeel Aanmelding
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6" *ngIf="isStaff">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Lede Bestuur</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>Bestuur bestaande lede se inligting en dokumentasie.</p>
                <ion-button expand="block" color="secondary">
                  <ion-icon name="settings" slot="start"></ion-icon>
                  Bestuur Lede
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Skandeer QR Kode</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>Skandeer kamp QR kode om outomaties te verbind en data te sinkroniseer.</p>
                <ion-button
                  expand="block"
                  color="tertiary"
                  (click)="scanQRToSync()"
                >
                  <ion-icon name="qr-code" slot="start"></ion-icon>
                  Skandeer QR Kode
                </ion-button>
                <ion-button
                  expand="block"
                  fill="outline"
                  (click)="manualSync()"
                >
                  <ion-icon name="sync" slot="start"></ion-icon>
                  Sinkronisasie
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6" *ngIf="showDebugTools">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Personeel Aanmelding</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>Meld aan as personeel.</p>
                <ion-button
                  expand="block"
                  color="warning"
                  (click)="navigateToLogin()"
                >
                  <ion-icon name="log-in" slot="start"></ion-icon>
                  Personeel Aanmelding
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6" *ngIf="showDebugTools">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Dokumentasie</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>Toegang tot handleidings en dokumentasie.</p>
                <ion-button expand="block" color="medium" disabled>
                  <ion-icon name="document-text" slot="start"></ion-icon>
                  Wys Dokumentasie
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>

    <ion-toast
      [isOpen]="isToastOpen"
      [message]="toastMessage"
      duration="3000"
      (didDismiss)="isToastOpen = false"
    >
    </ion-toast>
  `,
  styles: [
    `
      ion-card {
        margin: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      ion-card-content {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      ion-card-content p {
        margin-bottom: 1rem;
        flex: 1;
      }

      ion-button {
        margin-top: auto;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonToast,
    HeaderComponent,
  ],
})
export class HomePage implements OnInit {
  toastMessage = '';
  isToastOpen = false;
  entryCount: number | null = null;
  isStaff = false;
  hasMemberProfile = false;
  // Temporarily hide QR Scanner and Dokumentasie for debugging (1.21)
  showDebugTools = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly syncService: SyncService,
    private readonly databaseService: DatabaseService,
    private readonly qrProvisioningService: QRProvisioningService
  ) {
    addIcons({ personAdd, documentText, qrCode, settings, logIn, sync });
  }

  ngOnInit() {
    this.isStaff = this.authService.isAuthenticated();
    this.refreshDataCount();
    this.loadMemberProfileFlag();
  }

  // Ensure Home reflects latest state when navigated back to
  ionViewWillEnter() {
    this.isStaff = this.authService.isAuthenticated();
    this.refreshDataCount();
    this.loadMemberProfileFlag();
  }

  async refreshDataCount() {
    try {
      const entries = await this.databaseService.getAllEntries();
      this.entryCount = entries.length;
    } catch (error) {
      console.error('Error loading entry count:', error);
      this.entryCount = 0;
    }
  }

  private async loadMemberProfileFlag() {
    try {
      const current = await this.databaseService.getCurrentMemberEntry();
      this.hasMemberProfile = !!current;
    } catch {
      this.hasMemberProfile = false;
    }
  }

  navigateToMemberForm() {
    this.router.navigate(['/member-form']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToQRScanner() {
    this.router.navigate(['/qr-test']); // Reuse existing QR test page for now
  }

  // Method to handle camp QR scan (can be called from QR scanner)
  handleCampQRScan(qrData: string) {
    try {
      const data = JSON.parse(qrData);
      if (data.code && data.campId) {
        // Prefer first reachable serverUrl; fall back to environment base
        const urls: string[] = Array.isArray(data.serverUrls)
          ? data.serverUrls
          : data.serverUrl
          ? [data.serverUrl]
          : [];

        // Try each URL sequentially for exchange
        this.tryCampExchange(urls, data.code, data.campId);
      } else {
        this.showToast('Ongeldige kamp QR kode');
      }
    } catch (error) {
      this.showToast('Kan nie QR kode lees nie');
    }
  }

  private exchangeCampCode(code: string, campId: string) {
    this.authService.exchangeCampCode(code, campId).subscribe({
      next: (response) => {
        if (response.success) {
          this.authService.setSyncToken(response.syncToken);
          this.showToast(
            'Suksesvol verbind na kamp - data sal nou sinkroniseer'
          );

          // Trigger immediate sync
          this.syncService.sync().subscribe({
            next: (result) => {
              if (result.success) {
                this.showToast(
                  `Sinkronisasie voltooi: ${result.syncedRecords} rekords`
                );
                this.authService.setSyncToken(null); // Clear sync token after use
              }
            },
            error: (err) => {
              console.error('Sync failed:', err);
              this.showToast('Sinkronisasie gefaal');
            },
          });
        } else {
          this.showToast(response.error || 'Kamp verbinding gefaal');
        }
      },
      error: (err) => {
        console.error('Camp code exchange failed:', err);
        this.showToast('Kan nie na kamp verbind nie');
      },
    });
  }

  private tryCampExchange(urls: string[], code: string, campId: string) {
    if (!urls.length) {
      // Fallback to default API URL flow
      this.exchangeCampCode(code, campId);
      return;
    }

    const [current, ...rest] = urls;
    // Set base URL temporarily for this attempt
    this.authService.setCampBaseUrl(current.replace(/\/$/, ''));

    this.authService.exchangeCampCodeAt(current, code, campId).subscribe({
      next: (response) => {
        if (response.success) {
          // Persist chosen base URL for subsequent sync calls
          this.authService.setCampBaseUrl(current.replace(/\/$/, ''));
          this.authService.setSyncToken(response.syncToken);
          this.showToast(
            'Suksesvol verbind na kamp - data sal nou sinkroniseer'
          );

          this.syncService.sync().subscribe({
            next: (result) => {
              if (result.success) {
                this.showToast(
                  `Sinkronisasie voltooi: ${result.syncedRecords} rekords`
                );
                this.authService.setSyncToken(null);
              }
            },
            error: () => this.showToast('Sinkronisasie gefaal'),
          });
        } else {
          // Try next URL
          this.tryCampExchange(rest, code, campId);
        }
      },
      error: () => {
        // Try next URL on error
        this.tryCampExchange(rest, code, campId);
      },
    });
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
  }

  /**
   * Scan QR code to provision camp connection and sync
   * Directly uses ML Kit BarcodeScanner for mobile QR scanning
   */
  async scanQRToSync() {
    console.log('🔍 scanQRToSync called');
    alert('scanQRToSync called!'); // Visual confirmation

    try {
      // Import ML Kit scanner
      console.log('📦 Importing ML Kit...');
      const { BarcodeScanner, BarcodeFormat } = await import('@capacitor-mlkit/barcode-scanning');
      console.log('✅ ML Kit imported');
      alert('ML Kit imported!');

      // Request camera permission
      console.log('🎥 Requesting camera permission...');
      const permissionResult = await BarcodeScanner.requestPermissions();
      console.log('📋 Permission result:', permissionResult);

      if (permissionResult.camera !== 'granted') {
        console.log('❌ Camera permission denied');
        this.showToast('Kamera toegang geweier. Gee asseblief toestemming.');
        return;
      }

      console.log('📸 Starting QR scan...');

      // Start scanning (removed scanner-active CSS - might be blocking camera)
      const result = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });
      console.log('📊 Scan result:', result);
      alert(`Scan complete! Barcodes found: ${result.barcodes?.length || 0}`); // DEBUG

      // Check if scan was cancelled
      if (!result.barcodes || result.barcodes.length === 0) {
        console.log('QR scan cancelled or no QR detected');
        alert('No QR code detected! Try again with better lighting.'); // DEBUG
        return;
      }

      // Parse the first QR code found
      const rawValue = result.barcodes[0].rawValue;
      console.log('📄 Raw QR value:', rawValue);
      alert(`Raw QR data: ${rawValue?.substring(0, 50)}...`); // DEBUG first 50 chars

      if (!rawValue) {
        this.showToast('QR kode is leeg');
        alert('QR code is empty!'); // DEBUG
        return;
      }

      // Parse and validate QR payload
      const payload = JSON.parse(rawValue.trim());

      // Validate QR payload structure
      if (!payload.serverUrls || !payload.syncCode || !payload.campId) {
        this.showToast('Ongeldige QR kode. Vra kamp personeel vir nuwe QR.');
        return;
      }

      console.log('QR payload received:', payload);
      alert(`QR Scanned! URLs: ${payload.serverUrls?.join(', ') || 'none'}`); // DEBUG

      // Trigger provisioning flow
      console.log('Calling provisioning service...');
      alert('About to call scanAndProvision...'); // DEBUG
      try {
        const provisioningResult = await this.qrProvisioningService.scanAndProvision(payload);
        console.log('Provisioning result:', provisioningResult);
        alert(`Provisioning result: ${provisioningResult.success ? 'SUCCESS' : 'FAILED'}`); // DEBUG

        if (provisioningResult.success) {
          this.refreshDataCount(); // Refresh UI after sync
        } else {
          alert(`Error: ${provisioningResult.error}`); // DEBUG
        }
      } catch (provError: any) {
        alert(`Provisioning threw error: ${provError.message || provError}`); // DEBUG
        console.error('Provisioning threw error:', provError);
        this.showToast('Provisioning misluk');
      }
    } catch (error: any) {
      console.error('Failed to scan QR:', error);

      if (error.message && error.message.includes('JSON')) {
        this.showToast('Ongeldige QR kode formaat');
      } else {
        this.showToast('Kon nie QR skandeerder begin nie');
      }
    }
  }

  /**
   * Manual sync without QR code
   * Uses existing sync service with configured base URL
   */
  async manualSync() {
    this.syncService.sync().subscribe({
      next: (result) => {
        if (result.success) {
          this.showToast(
            `Sinkronisasie voltooi: ${result.syncedRecords} rekords`
          );
          this.refreshDataCount();
        } else {
          this.showToast('Sinkronisasie gefaal: ' + result.message);
        }
      },
      error: (err) => {
        console.error('Manual sync failed:', err);
        this.showToast('Sinkronisasie gefaal');
      },
    });
  }
}

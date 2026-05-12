import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonContent,
  IonIcon,
  IonToast,
  Platform,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  peopleOutline,
  qrCode,
  logIn,
  sync,
  settingsOutline,
} from 'ionicons/icons';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { SyncService } from '../../services/sync.service';
import { DatabaseService } from '../../services/database.service';
import { QRProvisioningService } from '../../services/qr-provisioning.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonToast, HeaderComponent],
})
export class HomePage implements OnInit {
  toastMessage = '';
  isToastOpen = false;
  entryCount: number | null = null;
  isStaff = false;
  hasMemberProfile = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly syncService: SyncService,
    private readonly databaseService: DatabaseService,
    private readonly qrProvisioningService: QRProvisioningService,
    private readonly alertController: AlertController,
    private readonly platform: Platform,
    public readonly roleService: RoleService
  ) {
    addIcons({
      personOutline,
      peopleOutline,
      qrCode,
      logIn,
      sync,
      settingsOutline,
    });
  }

  ngOnInit() {
    this.isStaff = this.authService.isAuthenticated();
    this.refreshDataCount();
    this.loadMemberProfileFlag();
    this.navigateBasedOnRole();
  }

  ionViewWillEnter() {
    this.isStaff = this.authService.isAuthenticated();
    this.refreshDataCount();
    this.loadMemberProfileFlag();
  }

  private navigateBasedOnRole() {
    if (this.roleService.isReceptionStaff()) {
      this.router.navigate(['/reception']);
    }
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

  async scanQRToSync() {
    if (!this.platform.is('hybrid') || this.platform.is('ios')) {
      const confirmed = await this.showWifiInstructionAlert();
      if (!confirmed) return;
    }

    try {
      const { BarcodeScanner, BarcodeFormat } = await import(
        '@capacitor-mlkit/barcode-scanning'
      );

      const permissionResult = await BarcodeScanner.requestPermissions();
      if (permissionResult.camera !== 'granted') {
        this.showToast('Kamera toegang geweier. Gee asseblief toestemming.');
        return;
      }

      const result = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      if (!result.barcodes || result.barcodes.length === 0) return;

      const rawValue = result.barcodes[0].rawValue;
      if (!rawValue) {
        this.showToast('QR kode is leeg');
        return;
      }

      const payload = JSON.parse(rawValue.trim());

      if (!payload.serverUrls || !payload.syncCode || !payload.campId) {
        this.showToast('Ongeldige QR kode. Vra kamp personeel vir nuwe QR.');
        return;
      }

      const provisioningResult =
        await this.qrProvisioningService.scanAndProvision(payload);
      if (provisioningResult.success) {
        this.refreshDataCount();
      }
    } catch (error: any) {
      if (error?.message?.includes('JSON')) {
        this.showToast('Ongeldige QR kode formaat');
      } else {
        this.showToast('Kon nie QR skandeerder begin nie');
      }
    }
  }

  private async showWifiInstructionAlert(): Promise<boolean> {
    const alert = await this.alertController.create({
      header: 'Koppel eerste aan WiFi',
      cssClass: 'wifi-instruction-alert',
      message:
        'iPhone koppel nie outomaties aan WiFi nie.\n\n1. Maak jou Settings oop\n2. Soek op SuidlandersKamp WiFi\n3. Koppel aan SuidlandersKamp\n4. Selekteer "Ek is gekoppel"',
      buttons: [
        { text: 'Kanselleer', role: 'cancel' },
        { text: 'Ek is gekoppel — Gaan voort', role: 'confirm' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

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
      error: () => this.showToast('Sinkronisasie gefaal'),
    });
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
  }
}

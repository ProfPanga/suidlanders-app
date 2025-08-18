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
} from 'ionicons/icons';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { SyncService } from '../../services/sync.service';

@Component({
  selector: 'app-home',
  template: `
    <app-header title="Suidlander Inligtingsvorm"></app-header>

    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col size="12" size-md="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Nuwe Lid Registrasie</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>
                  Registreer 'n nuwe lid met volledige inligting en
                  dokumentasie.
                </p>
                <ion-button expand="block" (click)="navigateToMemberForm()">
                  <ion-icon name="person-add" slot="start"></ion-icon>
                  Begin Registrasie
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Lede Bestuur</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>Bestuur bestaande lede se inligting en dokumentasie.</p>
                <ion-button expand="block" color="secondary" disabled>
                  <ion-icon name="settings" slot="start"></ion-icon>
                  Bestuur Lede
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>QR Kode Skandeerder</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>Skandeer QR kode om data na kamp te sinkroniseer.</p>
                <ion-button
                  expand="block"
                  color="tertiary"
                  (click)="navigateToQRScanner()"
                >
                  <ion-icon name="qr-code" slot="start"></ion-icon>
                  Verbind na Kamp
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

          <ion-col size="12" size-md="6">
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

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly syncService: SyncService
  ) {
    addIcons({ personAdd, documentText, qrCode, settings, logIn });
  }

  ngOnInit() {}

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
        this.exchangeCampCode(data.code, data.campId);
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

  private showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
  }
}

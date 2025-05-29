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
  IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAdd, documentText, qrCode, settings } from 'ionicons/icons';
import { HeaderComponent } from '../../components/header/header.component';

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
                <p>Registreer 'n nuwe lid met volledige inligting en dokumentasie.</p>
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
                <p>Skandeer QR kodes om lid inligting te ontvang.</p>
                <ion-button expand="block" color="tertiary" disabled>
                  <ion-icon name="qr-code" slot="start"></ion-icon>
                  Skandeer QR Kode
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
  `,
  styles: [`
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
  `],
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
    HeaderComponent
  ]
})
export class HomePage implements OnInit {
  constructor(private router: Router) {
    addIcons({ personAdd, documentText, qrCode, settings });
  }

  ngOnInit() {}

  navigateToMemberForm() {
    this.router.navigate(['/member-form']);
  }
} 
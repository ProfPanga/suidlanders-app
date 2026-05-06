import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonBackButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { settings } from 'ionicons/icons';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  template: `
    <ion-header>
      <ion-toolbar>
        @if (showBack) {
          <ion-buttons slot="start">
            <ion-back-button [defaultHref]="backHref"></ion-back-button>
          </ion-buttons>
        }
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="navigateToSettings()">
            <ion-icon name="settings"></ion-icon>
          </ion-button>
          <app-theme-toggle></app-theme-toggle>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
  `,
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonBackButton,
    ThemeToggleComponent
  ]
})
export class HeaderComponent {
  @Input() title: string = '';
  @Input() showBack = false;
  @Input() backHref = '/home';

  constructor(private readonly router: Router) {
    addIcons({ settings });
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }
} 
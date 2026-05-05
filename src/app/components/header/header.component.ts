import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { settings } from 'ionicons/icons';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  template: `
    <ion-header>
      <ion-toolbar>
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
    ThemeToggleComponent
  ]
})
export class HeaderComponent {
  @Input() title: string = '';

  constructor(private router: Router) {
    addIcons({ settings });
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }
} 
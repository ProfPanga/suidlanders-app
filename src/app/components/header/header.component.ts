import { Component, Input } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons } from '@ionic/angular/standalone';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
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
    ThemeToggleComponent
  ]
})
export class HeaderComponent {
  @Input() title: string = '';
} 
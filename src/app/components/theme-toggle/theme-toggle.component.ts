import { Component, OnInit } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { moon, sunny } from 'ionicons/icons';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <ion-button fill="clear" (click)="toggleTheme()">
      <ion-icon slot="icon-only" [name]="isDark ? 'sunny' : 'moon'"></ion-icon>
    </ion-button>
  `,
  standalone: true,
  imports: [IonButton, IonIcon, CommonModule]
})
export class ThemeToggleComponent implements OnInit {
  isDark = false;

  constructor(private themeService: ThemeService) {
    addIcons({ moon, sunny });
  }

  ngOnInit() {
    this.themeService.isDarkMode().subscribe(
      isDark => this.isDark = isDark
    );
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
} 
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  private prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    // Listen for system theme changes
    this.prefersDark.addEventListener('change', (e) => {
      const systemDark = e.matches;
      // Only update if user hasn't set a preference
      this.checkAndApplyTheme(systemDark);
    });

    this.loadTheme();
  }

  private async checkAndApplyTheme(systemDark: boolean) {
    const { value } = await Preferences.get({ key: 'darkMode' });
    // If no preference is set, use system preference
    if (value === null) {
      this.darkMode.next(systemDark);
      this.applyTheme(systemDark);
    }
  }

  async loadTheme() {
    try {
      const { value } = await Preferences.get({ key: 'darkMode' });
      // If no preference is set, use system preference
      const isDark = value === null ? this.prefersDark.matches : value === 'true';
      this.darkMode.next(isDark);
      this.applyTheme(isDark);
    } catch (err) {
      console.error('Error loading theme:', err);
      // Default to system preference if there's an error
      const systemDark = this.prefersDark.matches;
      this.darkMode.next(systemDark);
      this.applyTheme(systemDark);
    }
  }

  async toggleTheme() {
    try {
      const isDark = !this.darkMode.value;
      await Preferences.set({
        key: 'darkMode',
        value: isDark.toString()
      });
      this.darkMode.next(isDark);
      this.applyTheme(isDark);
    } catch (err) {
      console.error('Error toggling theme:', err);
    }
  }

  private applyTheme(isDark: boolean) {
    // Toggle the dark class on the document element
    document.documentElement.classList.toggle('dark', isDark);
    
    // Set the color-scheme property
    document.documentElement.style.setProperty('color-scheme', isDark ? 'dark' : 'light');
    
    // Set Ionic's color theme
    const prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDarkQuery.dispatchEvent(new Event('change'));
  }

  isDarkMode() {
    return this.darkMode.asObservable();
  }
} 
import { Injectable } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'xtracker-theme';

  initialize(): AppTheme {
    const theme = this.readTheme();
    this.apply(theme);
    return theme;
  }

  setTheme(theme: AppTheme): void {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch {
      // Private browsing or restricted storage should not block appearance.
    }
    this.apply(theme);
  }

  getTheme(): AppTheme {
    return this.readTheme();
  }

  private readTheme(): AppTheme {
    try {
      return localStorage.getItem(this.storageKey) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  private apply(theme: AppTheme): void {
    const isDark = theme === 'dark';
    for (const target of [document.documentElement, document.body]) {
      target.classList.toggle('app-dark', isDark);
      target.classList.toggle('ion-palette-dark', isDark);
    }

    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark ? '#0f1117' : '#b85c5c');
  }
}

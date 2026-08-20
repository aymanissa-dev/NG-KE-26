import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeChoice = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'decode-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  choice = signal<ThemeChoice>('system');
  resolvedTheme = signal<'light' | 'dark'>('dark');

  constructor() {
    if (!this.isBrowser) {
      // On the server there's no window/localStorage and no real user preference to
      // read — just render with a sane default. The browser will correct it on hydration.
      return;
    }

    this.choice.set(this.readStoredChoice());
    this.resolvedTheme.set(this.resolveTheme(this.choice()));
    document.documentElement.setAttribute('data-theme', this.resolvedTheme());

    effect(() => {
      const resolved = this.resolveTheme(this.choice());
      this.resolvedTheme.set(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.choice() === 'system') {
        this.resolvedTheme.set(this.resolveTheme('system'));
        document.documentElement.setAttribute('data-theme', this.resolvedTheme());
      }
    });
  }

  setChoice(choice: ThemeChoice): void {
    if (!this.isBrowser) return;

    this.choice.set(choice);
    if (choice === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, choice);
    }
  }

  toggle(): void {
    const next = this.resolvedTheme() === 'dark' ? 'light' : 'dark';
    this.setChoice(next);
  }

  private readStoredChoice(): ThemeChoice {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  }

  private resolveTheme(choice: ThemeChoice): 'light' | 'dark' {
    if (choice === 'light' || choice === 'dark') return choice;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}

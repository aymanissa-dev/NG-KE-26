import { Injectable, signal, effect } from '@angular/core';

export type Density = 'comfortable' | 'compact';
export type ExplanationLevel = 'beginner' | 'intermediate' | 'advanced';

const STORAGE_KEY = 'decode-settings';

interface StoredSettings {
  density: Density;
  explanationLevel: ExplanationLevel;
  fontSize: number;
  motionEnabled: boolean;
}

const DEFAULTS: StoredSettings = {
  density: 'comfortable',
  explanationLevel: 'intermediate',
  fontSize: 13,
  motionEnabled: true,
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  density = signal<Density>(DEFAULTS.density);
  explanationLevel = signal<ExplanationLevel>(DEFAULTS.explanationLevel);
  fontSize = signal<number>(DEFAULTS.fontSize);
  motionEnabled = signal<boolean>(DEFAULTS.motionEnabled);

  constructor() {
    const stored = this.readStored();
    this.density.set(stored.density);
    this.explanationLevel.set(stored.explanationLevel);
    this.fontSize.set(stored.fontSize);
    this.motionEnabled.set(stored.motionEnabled);

    // Applies every change to the document + localStorage, same pattern as ThemeService.
    effect(() => {
      document.documentElement.style.setProperty('--code-font-size', `${this.fontSize()}px`);
      document.documentElement.setAttribute('data-density', this.density());
      document.documentElement.setAttribute('data-motion', this.motionEnabled() ? 'on' : 'off');
      this.persist();
    });
  }

  setDensity(value: Density): void {
    this.density.set(value);
  }

  setExplanationLevel(value: ExplanationLevel): void {
    this.explanationLevel.set(value);
  }

  setFontSize(value: number): void {
    this.fontSize.set(value);
  }

  setMotionEnabled(value: boolean): void {
    this.motionEnabled.set(value);
  }

  private persist(): void {
    const value: StoredSettings = {
      density: this.density(),
      explanationLevel: this.explanationLevel(),
      fontSize: this.fontSize(),
      motionEnabled: this.motionEnabled(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }

  private readStored(): StoredSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULTS;
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return DEFAULTS;
    }
  }
}

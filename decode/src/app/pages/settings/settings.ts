import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppShell } from '../../shared/app-shell/app-shell';
import { ThemeService, ThemeChoice } from '../../core/theme';
import { SettingsService, Density, ExplanationLevel } from '../../core/settings';
import { AuthService } from '../../core/auth';
import { HistoryService } from '../../core/history';

@Component({
  selector: 'app-settings',
  imports: [AppShell],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  isDeleting = signal(false);
  deleteError = signal<string | null>(null);

  constructor(
    protected themeService: ThemeService,
    protected settingsService: SettingsService,
    private authService: AuthService,
    private historyService: HistoryService,
    private router: Router,
  ) {}

  setThemeChoice(choice: ThemeChoice): void {
    this.themeService.setChoice(choice);
  }

  setDensity(value: Density): void {
    this.settingsService.setDensity(value);
  }

  setExplanationLevel(value: ExplanationLevel): void {
    this.settingsService.setExplanationLevel(value);
  }

  onFontSliderInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.settingsService.setFontSize(value);
  }

  toggleMotion(): void {
    this.settingsService.setMotionEnabled(!this.settingsService.motionEnabled());
  }

  async deleteAccount(): Promise<void> {
    const confirmed = window.confirm(
      'This will permanently delete your account and all saved analyses. This cannot be undone. Continue?',
    );
    if (!confirmed) return;

    this.isDeleting.set(true);
    this.deleteError.set(null);

    try {
      await this.historyService.deleteAllEntries();
      await this.authService.deleteAccount();
      this.router.navigate(['/']);
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        this.deleteError.set(
          'For security, please log out and log back in, then try deleting your account again.',
        );
      } else {
        this.deleteError.set('Something went wrong deleting your account. Please try again.');
      }
      this.isDeleting.set(false);
    }
  }
}

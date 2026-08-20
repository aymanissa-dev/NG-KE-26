import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth';
import { ThemeService } from '../../core/theme';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    protected themeService: ThemeService,
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/workspace']);
    } catch (err: any) {
      this.errorMessage.set(this.friendlyError(err.code));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async onGoogleSignIn(): Promise<void> {
    this.errorMessage.set(null);
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/workspace']);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        this.errorMessage.set('Google sign-in failed. Please try again.');
      }
    }
  }

  private friendlyError(code: string): string {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect email or password.';
      case 'auth/invalid-email':
        return 'That email address looks invalid.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}

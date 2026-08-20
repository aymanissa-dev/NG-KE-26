import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  email = '';
  password = '';
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  passwordChecks = computed(() => {
    const val = this.password;
    return {
      length: val.length >= 8,
      upper: /[A-Z]/.test(val),
      lower: /[a-z]/.test(val),
      number: /[0-9]/.test(val),
      special: /[^A-Za-z0-9]/.test(val),
    };
  });

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    try {
      await this.authService.register(this.email, this.password);
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
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'That email address looks invalid.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}

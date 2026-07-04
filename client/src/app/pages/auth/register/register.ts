import { Component, signal, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'gz-register',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterPage {
  protected readonly fullName = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly agreeTerms = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly isSubmitting = signal(false);

  // Field validation errors
  protected readonly fullNameError = signal('');
  protected readonly emailError = signal('');
  protected readonly passwordError = signal('');
  protected readonly confirmPasswordError = signal('');
  protected readonly agreeTermsError = signal('');
  protected readonly serverError = signal('');

  // Password strength signal
  protected readonly passwordStrength = computed(() => {
    const p = this.password();
    if (!p) return { score: 0, label: 'None', colorClass: '' };

    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { score: 25, label: 'Weak', colorClass: 'weak' };
    if (score === 2 || score === 3) return { score: 60, label: 'Medium', colorClass: 'medium' };
    return { score: 100, label: 'Strong', colorClass: 'strong' };
  });

  constructor(private router: Router, private auth: AuthService) {}

  protected onFullNameInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.fullName.set(value);
    this.validateFullName(value);
  }

  protected onEmailInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.email.set(value);
    this.validateEmail(value);
  }

  protected onPasswordInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.password.set(value);
    this.validatePassword(value);
    if (this.confirmPassword()) {
      this.validateConfirmPassword(this.confirmPassword());
    }
  }

  protected onConfirmPasswordInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.confirmPassword.set(value);
    this.validateConfirmPassword(value);
  }

  protected onAgreeTermsChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.agreeTerms.set(checked);
    this.validateAgreeTerms(checked);
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.serverError.set('');

    const fullNameValid = this.validateFullName(this.fullName());
    const emailValid = this.validateEmail(this.email());
    const passwordValid = this.validatePassword(this.password());
    const confirmPasswordValid = this.validateConfirmPassword(this.confirmPassword());
    const agreeTermsValid = this.validateAgreeTerms(this.agreeTerms());

    if (!fullNameValid || !emailValid || !passwordValid || !confirmPasswordValid || !agreeTermsValid) {
      return;
    }

    this.isSubmitting.set(true);

    // Simulate register — replace with real API call
    setTimeout(() => {
      this.auth.login(
        { id: '1', fullName: this.fullName(), email: this.email() },
        'mock-access-token'
      );
      this.isSubmitting.set(false);
      this.router.navigate(['/workspace/dashboard']);
    }, 1200);
  }

  private validateFullName(value: string): boolean {
    if (!value.trim()) {
      this.fullNameError.set('Full name is required');
      return false;
    }
    if (value.trim().length < 2) {
      this.fullNameError.set('Name must be at least 2 characters');
      return false;
    }
    this.fullNameError.set('');
    return true;
  }

  private validateEmail(value: string): boolean {
    if (!value) {
      this.emailError.set('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      this.emailError.set('Please enter a valid email address');
      return false;
    }
    this.emailError.set('');
    return true;
  }

  private validatePassword(value: string): boolean {
    if (!value) {
      this.passwordError.set('Password is required');
      return false;
    }
    if (value.length < 8) {
      this.passwordError.set('Password must be at least 8 characters');
      return false;
    }
    this.passwordError.set('');
    return true;
  }

  private validateConfirmPassword(value: string): boolean {
    if (!value) {
      this.confirmPasswordError.set('Confirm password is required');
      return false;
    }
    if (value !== this.password()) {
      this.confirmPasswordError.set('Passwords do not match');
      return false;
    }
    this.confirmPasswordError.set('');
    return true;
  }

  private validateAgreeTerms(value: boolean): boolean {
    if (!value) {
      this.agreeTermsError.set('You must agree to the Terms and Privacy Policy');
      return false;
    }
    this.agreeTermsError.set('');
    return true;
  }
}

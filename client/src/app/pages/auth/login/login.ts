import { Component, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'gz-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginPage {
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly showPassword = signal(false);
  protected readonly rememberMe = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly emailError = signal('');
  protected readonly passwordError = signal('');
  protected readonly serverError = signal('');

  constructor(private router: Router, private auth: AuthService) {}

  protected onEmailInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.email.set(value);
    this.validateEmail(value);
  }

  protected onPasswordInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.password.set(value);
    this.validatePassword(value);
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  protected toggleRememberMe(): void {
    this.rememberMe.update(v => !v);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.serverError.set('');

    const emailValid = this.validateEmail(this.email());
    const passwordValid = this.validatePassword(this.password());

    if (!emailValid || !passwordValid) {
      return;
    }

    this.isSubmitting.set(true);

    // Real API call to login endpoint
    window.fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.email(), password: this.password() })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }
      this.auth.login(
        { id: String(data.user.id), fullName: data.user.fullName, email: data.user.email },
        data.accessToken
      );
      this.isSubmitting.set(false);
      this.router.navigate(['/workspace/dashboard']);
    })
    .catch(err => {
      this.isSubmitting.set(false);
      this.serverError.set(err.message || 'Invalid credentials or server error.');
    });
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
}

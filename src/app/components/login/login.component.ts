import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private firestore = inject(Firestore);
  private router = inject(Router);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  identifier = '';
  password = '';
  passwordBoolean = false;
  errorMessage = '';
  isDarkMode = false;

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });
  }

  changePasswordState() {
    this.passwordBoolean = !this.passwordBoolean;
  }

  async resolveEmail(username: string): Promise<string> {
    const ref = doc(this.firestore, `users/${username}`);
    const snap = await getDoc(ref);

    if (!snap.exists()) throw new Error('User not found');
    const data = snap.data();
    if (!data?.['email']) throw new Error('No email associated');

    return data?.['email'];
  }

  async logIn() {
    try {
      const email = this.identifier.includes('@')
        ? this.identifier
        : await this.resolveEmail(this.identifier);

      await this.authService.login(email, this.password);
      await this.authService.fetchUsername();
      this.router.navigate(['/players-list']);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  async logInWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      await this.authService.fetchUsername();
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}

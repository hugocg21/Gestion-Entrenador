import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ThemeService } from '../../services/theme.service';

interface UserData {
  email: string;
  username: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  identifier: string = ''; // Puede ser correo o nombre de usuario
  password: string = '';
  passwordBoolean: boolean = false;
  errorMessage: string = '';
  invalidCredentials: boolean = false;

  constructor(
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private router: Router,
    private firestore: AngularFirestore, private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Escuchar los cambios en el modo oscuro
    this.themeService.isDarkMode$.subscribe((isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });
  }

  // Cambiar la visibilidad de la contraseña
  changePasswordState() {
    this.passwordBoolean = !this.passwordBoolean;
  }

  // Método para resolver el correo a partir del nombre de usuario
  private async resolveEmail(username: string): Promise<string> {
    const userDoc = await this.firestore
      .collection('users')
      .doc<UserData>(username)
      .get()
      .toPromise();

    if (!userDoc || !userDoc.exists) {
      throw new Error('User not found.');
    }

    const userData = userDoc.data();
    if (!userData || !userData.email) {
      throw new Error('No email associated with this username.');
    }

    return userData.email;
  }

  // Método para iniciar sesión
  async logIn() {
    try {
      // Resolver correo si el identificador es un nombre de usuario
      const email = this.identifier.includes('@')
        ? this.identifier
        : await this.resolveEmail(this.identifier);

      // Iniciar sesión con Firebase Authentication
      await this.afAuth.signInWithEmailAndPassword(email, this.password);

      // Fetch y almacenar el nombre de usuario tras el inicio de sesión
      await this.authService.fetchUsername();

      // Redirigir al componente de jugadores
      this.router.navigate(['/players-list']);
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred during login.';
      this.invalidCredentials = true;
    }
  }

  isDarkMode: boolean = false;

  toggleDarkMode() {
    this.themeService.toggleDarkMode(); // Cambiar el tema
  }

  async logInWithGoogle() {
  try {
    await this.authService.loginWithGoogle();
    await this.authService.fetchUsername(); // Si quieres buscar nombre de usuario
    this.router.navigate(['/players-list']);
  } catch (error: any) {
    this.errorMessage = error.message || 'An error occurred with Google login.';
    this.invalidCredentials = true;
  }
}
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  email: string = '';
  username: string = '';
  passwordValue: string = '';
  repeatPassword: string = '';
  password: boolean = false;
  repeatedPassword: boolean = false;
  errorMessage: string = '';

  constructor(private afAuth: AngularFireAuth, private router: Router, private firestore: AngularFirestore) {}

  changePasswordState() {
    this.password = !this.password;
  }

  changeRepeatedPasswordState() {
    this.repeatedPassword = !this.repeatedPassword;
  }

  async register() {
    if (this.passwordValue !== this.repeatPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    try {
      // Verificar si el nombre de usuario ya existe
      const usernameQuerySnapshot = await this.firestore
        .collection('users', (ref) => ref.where('username', '==', this.username))
        .get()
        .toPromise();

      if (usernameQuerySnapshot && !usernameQuerySnapshot.empty) {
        this.errorMessage = 'Username is already taken.';
        return;
      }

      // Crear el usuario en Firebase Authentication
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(
        this.email,
        this.passwordValue
      );

      // Almacenar el usuario en Firestore con el nombre de usuario como ID
      await this.firestore.collection('users').doc(this.username).set({
        email: this.email,
        username: this.username,
      });

      // Redirigir al login después de un registro exitoso
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred during registration.';
    }
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app'; // Asegúrate de importar esto

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedInSource = new BehaviorSubject<boolean>(this.getInitialLoggedInState());
  loggedIn$ = this.loggedInSource.asObservable();

  private usernameSource = new BehaviorSubject<string | null>(this.getInitialUsernameState());
  username$ = this.usernameSource.asObservable();

  private currentUserUid: string | null = null;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore
  ) {
    // Escucha el estado de autenticación
    this.afAuth.authState.subscribe(async (user) => {
      if (user) {
        this.currentUserUid = user.uid;
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('uid', user.uid);

        // Obtener y almacenar el nombre de usuario
        const username = await this.fetchUsernameFromFirestore(user.email);
        if (username) {
          this.usernameSource.next(username);
          localStorage.setItem('username', username);
        }

        this.loggedInSource.next(true);
      } else {
        this.clearAuthData();
      }
    });
  }

  // Obtiene el nombre de usuario desde Firestore
  private async fetchUsernameFromFirestore(email: string | null): Promise<string | null> {
    if (!email) return null;

    const userDoc = await this.firestore
      .collection('users')
      .ref.where('email', '==', email)
      .get();

    if (!userDoc.empty) {
      return userDoc.docs[0].id; // Nombre de usuario como ID
    }

    return null;
  }

  // Limpia los datos de autenticación
  private clearAuthData() {
    this.currentUserUid = null;
    this.loggedInSource.next(false);
    this.usernameSource.next(null);
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('uid');
    localStorage.removeItem('username');
  }

  // Obtiene el estado inicial desde localStorage
  private getInitialLoggedInState(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }

  // Obtiene el nombre de usuario inicial desde localStorage
  private getInitialUsernameState(): string | null {
    return localStorage.getItem('username');
  }

  // Inicia sesión con email y contraseña
  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  // Cierra sesión
  logout() {
    this.afAuth.signOut().then(() => {
      this.clearAuthData();
      this.router.navigate(['/login']);
    });
  }

  // Obtiene el nombre de usuario actual
  getUsername(): string | null {
    return this.usernameSource.value || localStorage.getItem('username');
  }

  // Obtiene el UID del usuario actual
  getUid(): string | null {
    return this.currentUserUid || localStorage.getItem('uid');
  }

  // Verifica si el usuario está autenticado
  isLoggedIn(): boolean {
    return this.loggedInSource.value;
  }

  // Método explícito para obtener el nombre de usuario desde Firestore
  async fetchUsername() {
    const user = await this.afAuth.currentUser;
    if (user) {
      const username = await this.fetchUsernameFromFirestore(user.email);
      if (username) {
        this.usernameSource.next(username);
        localStorage.setItem('username', username);
      }
    }
  }

  loginWithGoogle() {
  return this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
}
}

// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from '@angular/fire/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { TeamSelectionService } from './team-selection.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  private loggedInSource = new BehaviorSubject<boolean>(
    localStorage.getItem('loggedIn') === 'true'
  );
  loggedIn$ = this.loggedInSource.asObservable();

  private usernameSource = new BehaviorSubject<string | null>(
    localStorage.getItem('username')
  );
  username$ = this.usernameSource.asObservable();

  private currentUserUid: string | null = localStorage.getItem('uid');

  constructor() {
    authState(this.auth).subscribe(async (user) => {
      if (user) {
        this.currentUserUid = user.uid;
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('uid', user.uid);

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

  private async fetchUsernameFromFirestore(
    email: string | null
  ): Promise<string | null> {
    if (!email) return null;

    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    return snapshot.empty ? null : snapshot.docs[0].id;
  }

  private clearAuthData(): void {
    this.currentUserUid = null;
    this.loggedInSource.next(false);
    this.usernameSource.next(null);
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('uid');
    localStorage.removeItem('username');
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  private teamSel = inject(TeamSelectionService); // ← inyecta

  logout(): void {
    signOut(this.auth).then(() => {
      this.clearAuthData();
      this.teamSel.clearSelection(); // ← limpia selección del equipo
      this.router.navigate(['/login']);
    });
  }

  getUsername(): string | null {
    return this.usernameSource.value;
  }

  getUid(): string | null {
    return this.currentUserUid;
  }

  isLoggedIn(): boolean {
    return this.loggedInSource.value;
  }

  async fetchUsername(): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      const username = await this.fetchUsernameFromFirestore(user.email);
      if (username) {
        this.usernameSource.next(username);
        localStorage.setItem('username', username);
      }
    }
  }
}

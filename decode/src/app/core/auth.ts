import { Injectable, signal } from '@angular/core';
import {
  Auth,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  deleteUser,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  Firestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firebaseApp } from './firebase.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth = getAuth(firebaseApp);
  private firestore: Firestore = getFirestore(firebaseApp);
  currentUser = signal<User | null>(null);

  private resolveAuthReady!: () => void;
  authReady: Promise<void> = new Promise((resolve) => {
    this.resolveAuthReady = resolve;
  });

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.resolveAuthReady();
    });
  }

  async register(email: string, password: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    await setDoc(doc(this.firestore, 'users', credential.user.uid), {
      email: credential.user.email,
      displayName: '',
      createdAt: serverTimestamp(),
    });
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.auth, provider);

    const userDocRef = doc(this.firestore, 'users', credential.user.uid);
    const existing = await getDoc(userDocRef);
    if (!existing.exists()) {
      await setDoc(userDocRef, {
        email: credential.user.email,
        displayName: credential.user.displayName ?? '',
        createdAt: serverTimestamp(),
      });
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async deleteAccount(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Not signed in.');

    await deleteDoc(doc(this.firestore, 'users', user.uid));
    await deleteUser(user);
  }
}

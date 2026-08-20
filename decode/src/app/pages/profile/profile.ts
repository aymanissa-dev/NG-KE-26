import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { AppShell } from '../../shared/app-shell/app-shell';
import { AuthService } from '../../core/auth';
import { firebaseApp } from '../../core/firebase.config';

interface UserProfile {
  email: string;
  displayName: string;
}

@Component({
  selector: 'app-profile',
  imports: [FormsModule, AppShell],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private firestore: Firestore = getFirestore(firebaseApp);

  profile = signal<UserProfile | null>(null);
  displayName = '';
  isLoading = signal(true);
  isSaving = signal(false);
  saveSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    await this.authService.authReady;

    const user = this.authService.currentUser();
    if (!user) {
      this.errorMessage.set('Not signed in.');
      this.isLoading.set(false);
      return;
    }

    try {
      const snapshot = await getDoc(doc(this.firestore, 'users', user.uid));
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        this.profile.set(data);
        this.displayName = data.displayName ?? '';
      }
    } catch {
      this.errorMessage.set('Could not load your profile.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSave(): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;

    this.isSaving.set(true);
    this.saveSuccess.set(false);
    this.errorMessage.set(null);

    try {
      await updateDoc(doc(this.firestore, 'users', user.uid), {
        displayName: this.displayName,
      });
      this.saveSuccess.set(true);
    } catch {
      this.errorMessage.set('Could not save your changes.');
    } finally {
      this.isSaving.set(false);
    }
  }
}

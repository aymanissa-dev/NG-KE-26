import { Injectable, signal } from '@angular/core';
import {
  Firestore,
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firebaseApp } from './firebase.config';
import { AuthService } from './auth';
import { CodeAnalysis } from './analysis.types';

export interface HistoryEntry {
  id: string;
  codeSnippet: string;
  language: string;
  summary: string;
  analysis: CodeAnalysis;
  createdAt: Date | null;
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private firestore: Firestore = getFirestore(firebaseApp);

  recent = signal<HistoryEntry[]>([]);
  selectedAnalysisId = signal<string | null>(null);

  constructor(private authService: AuthService) {}

  async loadRecent(max = 8): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) {
      this.recent.set([]);
      return;
    }

    try {
      const colRef = collection(this.firestore, 'users', user.uid, 'analyses');
      const q = query(colRef, orderBy('createdAt', 'desc'), limit(max));
      const snapshot = await getDocs(q);

      this.recent.set(
        snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            codeSnippet: data.codeSnippet,
            language: data.language,
            summary: data.summary,
            analysis: data.analysis,
            createdAt: data.createdAt?.toDate?.() ?? null,
          };
        }),
      );
    } catch (err) {
      console.error('Failed to load history:', err);
      this.recent.set([]);
    }
  }

  async save(codeSnippet: string, analysis: CodeAnalysis): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;

    const colRef = collection(this.firestore, 'users', user.uid, 'analyses');
    await addDoc(colRef, {
      codeSnippet,
      language: analysis.language,
      summary: analysis.summary,
      analysis,
      createdAt: serverTimestamp(),
    });

    await this.loadRecent();
  }

  async deleteEntry(id: string): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;

    await deleteDoc(doc(this.firestore, 'users', user.uid, 'analyses', id));

    if (this.selectedAnalysisId() === id) {
      this.selectedAnalysisId.set(null);
    }

    await this.loadRecent();
  }

  async deleteAllEntries(): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;

    const colRef = collection(this.firestore, 'users', user.uid, 'analyses');
    const snapshot = await getDocs(colRef);
    await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));

    this.recent.set([]);
    this.selectedAnalysisId.set(null);
  }

  async getById(id: string): Promise<HistoryEntry | null> {
    const user = this.authService.currentUser();
    if (!user) return null;

    const docRef = doc(this.firestore, 'users', user.uid, 'analyses', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;

    const data = snapshot.data() as any;
    return {
      id: snapshot.id,
      codeSnippet: data.codeSnippet,
      language: data.language,
      summary: data.summary,
      analysis: data.analysis,
      createdAt: data.createdAt?.toDate?.() ?? null,
    };
  }

  selectAnalysis(id: string): void {
    this.selectedAnalysisId.set(id);
  }

  clearSelection(): void {
    this.selectedAnalysisId.set(null);
  }
}

import { initializeApp, FirebaseApp } from 'firebase/app';
import { environment } from '../../environments/environment';

export const firebaseApp: FirebaseApp = initializeApp(environment.firebase);

// Firebase Service - Universal Firebase interface for both client and server
import { adminDb, firebaseAvailable as adminAvailable } from './firebase-admin';

// Client-side imports (only used when admin is not available)
let clientApp: any = null;
let clientDb: any = null;

async function getClientFirestore() {
  if (!clientDb) {
    // Dynamically import client Firebase only when needed
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore, connectFirestoreEmulator } = await import('firebase/firestore');
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    clientApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    clientDb = getFirestore(clientApp);
  }
  
  return clientDb;
}

// Universal Firebase service
export class FirebaseService {
  static async getDb() {
    if (adminAvailable && adminDb) {
      return { db: adminDb, isAdmin: true };
    } else {
      console.log('🔄 Using client Firebase SDK for API operations');
      const db = await getClientFirestore();
      return { db, isAdmin: false };
    }
  }

  static async getCollection(collectionName: string) {
    const { db, isAdmin } = await this.getDb();
    
    if (isAdmin) {
      return db.collection(collectionName);
    } else {
      // Client SDK
      const { collection } = await import('firebase/firestore');
      return collection(db, collectionName);
    }
  }

  static async getDocs(collectionRef: any, isAdmin: boolean = false) {
    if (isAdmin || adminAvailable) {
      return await collectionRef.get();
    } else {
      const { getDocs } = await import('firebase/firestore');
      return await getDocs(collectionRef);
    }
  }

  static async getDoc(docRef: any, isAdmin: boolean = false) {
    if (isAdmin || adminAvailable) {
      return await docRef.get();
    } else {
      const { getDoc } = await import('firebase/firestore');
      return await getDoc(docRef);
    }
  }

  static async setDoc(docRef: any, data: any, isAdmin: boolean = false) {
    if (isAdmin || adminAvailable) {
      return await docRef.set(data);
    } else {
      const { setDoc } = await import('firebase/firestore');
      return await setDoc(docRef, data);
    }
  }

  static async updateDoc(docRef: any, data: any, isAdmin: boolean = false) {
    if (isAdmin || adminAvailable) {
      return await docRef.update(data);
    } else {
      const { updateDoc } = await import('firebase/firestore');
      return await updateDoc(docRef, data);
    }
  }

  static async deleteDoc(docRef: any, isAdmin: boolean = false) {
    if (isAdmin || adminAvailable) {
      return await docRef.delete();
    } else {
      const { deleteDoc } = await import('firebase/firestore');
      return await deleteDoc(docRef);
    }
  }

  static async doc(collectionName: string, docId: string) {
    const { db, isAdmin } = await this.getDb();
    
    if (isAdmin) {
      return { ref: db.collection(collectionName).doc(docId), isAdmin };
    } else {
      const { doc } = await import('firebase/firestore');
      return { ref: doc(db, collectionName, docId), isAdmin };
    }
  }
}

export default FirebaseService;

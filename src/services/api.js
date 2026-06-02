import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// Initialize Cloud Storage
export const storage = getStorage(app);

/**
 * Auth Helpers
 */
export const loginAdmin = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutAdmin = async () => {
  return signOut(auth);
};

/**
 * Sends a Bespoke Garment request to the Firebase Firestore 'bespoke_requests' collection.
 */
export const sendBespokeRequest = async (formData) => {
  try {
    console.log("Sending Bespoke Request to Firebase:", formData);
    const docRef = await addDoc(collection(db, 'bespoke_requests'), {
      ...formData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    // Add to 'mail' collection for Trigger Email extension
    await addDoc(collection(db, 'mail'), {
      to: 'admin@ikebee.com', // Replace with actual admin email if needed
      message: {
        subject: `New Bespoke Request from ${formData.name}`,
        html: `
          <h2>New Bespoke Garment Request</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Phone:</strong> ${formData.phone}</p>
          <p><strong>Garment Type:</strong> ${formData.garmentType}</p>
          <p><strong>Measurements:</strong> ${formData.measurements}</p>
          <p><strong>Additional Notes:</strong> ${formData.notes}</p>
        `
      }
    });

    console.log("Bespoke request written with ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error sending bespoke request:', error);
    throw error;
  }
};

/**
 * Sends an Inquiry Bag request to the Firebase Firestore 'inquiries' collection.
 */
export const sendInquiryRequest = async (inquiryData) => {
  try {
    console.log("Sending Inquiry Bag to Firebase:", inquiryData);
    const docRef = await addDoc(collection(db, 'inquiries'), {
      ...inquiryData,
      status: 'new',
      createdAt: serverTimestamp()
    });

    // Add to 'mail' collection for Trigger Email extension
    await addDoc(collection(db, 'mail'), {
      to: 'admin@ikebee.com', // Replace with actual admin email
      message: {
        subject: `New Private Inquiry for ${inquiryData.productName}`,
        html: `
          <h2>New Private Inquiry</h2>
          <p><strong>Name:</strong> ${inquiryData.name}</p>
          <p><strong>Email:</strong> ${inquiryData.email}</p>
          <p><strong>Product ID:</strong> ${inquiryData.productId}</p>
          <p><strong>Product Name:</strong> ${inquiryData.productName}</p>
          <p><strong>Size Requested:</strong> ${inquiryData.size}</p>
        `
      }
    });

    console.log("Inquiry request written with ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error sending inquiry:', error);
    throw error;
  }
};

/**
 * Subscribes an email to the Firebase Firestore 'newsletter_subscribers' collection.
 */
export const subscribeNewsletter = async (email) => {
  try {
    console.log("Subscribing to Newsletter via Firebase:", email);
    const docRef = await addDoc(collection(db, 'newsletter_subscribers'), {
      email,
      subscribedAt: serverTimestamp()
    });
    console.log("Newsletter subscription written with ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
};

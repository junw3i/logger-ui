import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCgWDgbP5kJ0Qyy5DPqecT75gzgD6LlHoA',
  authDomain: 'funding-5f00c.firebaseapp.com',
  projectId: 'funding-5f00c',
  storageBucket: 'funding-5f00c.appspot.com',
  messagingSenderId: '776617672740',
  appId: '1:776617672740:web:3c89a337a1bc1f74f898b1',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
const db = getFirestore(app)

export { db }

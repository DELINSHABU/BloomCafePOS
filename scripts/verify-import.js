// Verification script for imported Firebase data
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8mwcfmiULd-NZKIv1bI2RBJsFnLxbfeg",
  authDomain: "bloom-graden-cafe-user-login.firebaseapp.com",
  databaseURL: "https://bloom-graden-cafe-user-login-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "bloom-graden-cafe-user-login",
  storageBucket: "bloom-graden-cafe-user-login.firebasestorage.app",
  messagingSenderId: "939336590102",
  appId: "1:939336590102:web:7c702aaaa3161b626ca637",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections to check
const COLLECTIONS = [
  'inventory',
  'reviews', 
  'events',
  'gallery',
  'blogs',
  'about',
  'menu',
  'orders',
  'combos',
  'offers',
  'specials',
  'menu_availability',
  'analytics',
  'permissions'
];

/**
 * Verify a collection
 */
async function verifyCollection(collectionName) {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, limit(3));
    const snapshot = await getDocs(q);
    
    console.log(`📊 Collection: ${collectionName}`);
    console.log(`   Total documents: ${snapshot.size} (showing first 3)`);
    
    if (!snapshot.empty) {
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   Document ${index + 1}: ${doc.id}`);
        if (data.name) console.log(`     Name: ${data.name}`);
        if (data.title) console.log(`     Title: ${data.title}`);
        if (data.id) console.log(`     ID: ${data.id}`);
        if (data.total) console.log(`     Total: ${data.total}`);
      });
    } else {
      console.log(`   ⚠️  No documents found`);
    }
    console.log('');
    
    return snapshot.size;
  } catch (error) {
    console.error(`   ❌ Error verifying ${collectionName}:`, error.message);
    console.log('');
    return 0;
  }
}

/**
 * Main verification function
 */
async function verifyImport() {
  console.log('🔍 Verifying Firebase Import Results');
  console.log(`📍 Project: ${firebaseConfig.projectId}`);
  console.log(`🎯 Database: Firestore`);
  console.log('');
  
  let totalCollections = 0;
  let totalDocuments = 0;
  let successfulCollections = 0;
  
  for (const collectionName of COLLECTIONS) {
    totalCollections++;
    const docCount = await verifyCollection(collectionName);
    if (docCount > 0) {
      successfulCollections++;
      totalDocuments += docCount;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('📈 Verification Summary:');
  console.log(`   Collections checked: ${totalCollections}`);
  console.log(`   Collections with data: ${successfulCollections}`);
  console.log(`   Sample documents shown: ${totalDocuments}`);
  console.log('');
  
  if (successfulCollections > 0) {
    console.log('✅ Import verification successful!');
    console.log(`🌐 View all data at: https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`);
  } else {
    console.log('❌ No data found in any collections');
  }
}

// Run the verification
if (require.main === module) {
  verifyImport()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Verification failed:', error.message);
      process.exit(1);
    });
}

module.exports = { verifyImport };

#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, deleteDoc, getDocs, writeBatch } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Complete Data Migration to Firebase Firestore...');
console.log('===========================================================');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8mwcfmiULd-NZKIv1bI2RBJsFnLxbfeg",
  authDomain: "bloom-graden-cafe-user-login.firebaseapp.com",
  projectId: "bloom-graden-cafe-user-login",
  storageBucket: "bloom-graden-cafe-user-login.firebasestorage.app",
  messagingSenderId: "939336590102",
  appId: "1:939336590102:web:7c702aaaa3161b626ca637",
  databaseURL: "https://bloom-graden-cafe-user-login-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Migration functions for different data types
const migrations = {
  // 1. Menu Data Migration
  async menu() {
    console.log('\n📋 1. MIGRATING MENU DATA');
    console.log('========================');
    
    try {
      const menuPath = path.join(process.cwd(), 'menu.json');
      const menuContent = fs.readFileSync(menuPath, 'utf8');
      const menuData = JSON.parse(menuContent);

      console.log(`Found ${menuData.menu?.length || 0} categories to migrate`);

      if (!menuData.menu || !Array.isArray(menuData.menu)) {
        throw new Error('Invalid menu.json structure');
      }

      // Clear existing menu data
      console.log('🗑️ Clearing existing menu data...');
      const menuCollection = collection(db, 'menu');
      const existingDocs = await getDocs(menuCollection);
      
      const batch = writeBatch(db);
      existingDocs.forEach(docSnapshot => {
        batch.delete(docSnapshot.ref);
      });
      await batch.commit();

      // Add menu items to Firestore
      console.log('📝 Adding menu items to Firestore...');
      let totalItems = 0;
      const menuBatch = writeBatch(db);

      for (const category of menuData.menu) {
        console.log(`  Processing category: ${category.category}`);
        
        for (const product of category.products) {
          const menuItem = {
            itemNo: product.itemNo,
            name: product.name.trim(),
            rate: product.rate,
            category: category.category,
            available: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const docRef = doc(db, 'menu', product.itemNo);
          menuBatch.set(docRef, menuItem);
          totalItems++;
        }
      }

      await menuBatch.commit();
      console.log(`✅ Successfully migrated ${totalItems} menu items`);
      return { success: true, count: totalItems };

    } catch (error) {
      console.error('❌ Error migrating menu data:', error);
      return { success: false, error: error.message };
    }
  },

  // 2. Menu Availability Migration
  async menuAvailability() {
    console.log('\n🔄 2. MIGRATING MENU AVAILABILITY');
    console.log('=================================');
    
    try {
      const availabilityPath = path.join(process.cwd(), 'menu-availability.json');
      
      if (!fs.existsSync(availabilityPath)) {
        console.log('⚠️ menu-availability.json not found, skipping...');
        return { success: true, count: 0 };
      }

      const availabilityContent = fs.readFileSync(availabilityPath, 'utf8');
      const availabilityData = JSON.parse(availabilityContent);

      console.log(`Found availability data for ${Object.keys(availabilityData.items || {}).length} items`);

      const batch = writeBatch(db);
      let updatedCount = 0;

      for (const [itemNo, data] of Object.entries(availabilityData.items || {})) {
        const docRef = doc(db, 'menu', itemNo);
        
        const updateData = {
          available: data.available !== undefined ? data.available : true,
          updatedAt: new Date()
        };

        if (data.price) {
          updateData.rate = data.price;
        }

        batch.update(docRef, updateData);
        updatedCount++;
      }

      if (updatedCount > 0) {
        await batch.commit();
        console.log(`✅ Successfully updated availability for ${updatedCount} items`);
      }

      return { success: true, count: updatedCount };

    } catch (error) {
      console.error('❌ Error migrating availability data:', error);
      return { success: false, error: error.message };
    }
  },

  // 3. Orders Migration
  async orders() {
    console.log('\n📦 3. MIGRATING ORDERS DATA');
    console.log('===========================');
    
    try {
      const ordersPath = path.join(process.cwd(), 'orders.json');
      
      if (!fs.existsSync(ordersPath)) {
        console.log('⚠️ orders.json not found, skipping...');
        return { success: true, count: 0 };
      }

      const ordersContent = fs.readFileSync(ordersPath, 'utf8');
      const ordersData = JSON.parse(ordersContent);

      const orders = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
      console.log(`Found ${orders.length} orders to migrate`);

      if (orders.length === 0) {
        console.log('No orders to migrate');
        return { success: true, count: 0 };
      }

      const batch = writeBatch(db);
      let count = 0;

      for (const order of orders) {
        const orderId = order.id || `order_${Date.now()}_${count}`;
        const orderData = {
          ...order,
          id: orderId,
          migratedAt: new Date(),
          timestamp: order.timestamp ? new Date(order.timestamp) : new Date()
        };

        const docRef = doc(db, 'orders', orderId);
        batch.set(docRef, orderData);
        count++;
      }

      await batch.commit();
      console.log(`✅ Successfully migrated ${count} orders`);
      return { success: true, count };

    } catch (error) {
      console.error('❌ Error migrating orders data:', error);
      return { success: false, error: error.message };
    }
  },

  // 4. Inventory Migration
  async inventory() {
    console.log('\n📦 4. MIGRATING INVENTORY DATA');
    console.log('==============================');
    
    try {
      const inventoryPath = path.join(process.cwd(), 'data/inventory.json');
      
      if (!fs.existsSync(inventoryPath)) {
        console.log('⚠️ inventory.json not found, skipping...');
        return { success: true, count: 0 };
      }

      const inventoryContent = fs.readFileSync(inventoryPath, 'utf8');
      const inventoryData = JSON.parse(inventoryContent);

      const items = inventoryData.inventory || [];
      console.log(`Found ${items.length} inventory items to migrate`);

      if (items.length === 0) {
        console.log('No inventory items to migrate');
        return { success: true, count: 0 };
      }

      const batch = writeBatch(db);
      let count = 0;

      for (const item of items) {
        const itemId = item.id || `item_${count}`;
        const itemData = {
          ...item,
          id: itemId,
          migratedAt: new Date(),
          updatedAt: new Date()
        };

        const docRef = doc(db, 'inventory', itemId);
        batch.set(docRef, itemData);
        count++;
      }

      await batch.commit();
      console.log(`✅ Successfully migrated ${count} inventory items`);
      return { success: true, count };

    } catch (error) {
      console.error('❌ Error migrating inventory data:', error);
      return { success: false, error: error.message };
    }
  },

  // 5. Blog Posts Migration
  async blogPosts() {
    console.log('\n📝 5. MIGRATING BLOG POSTS');
    console.log('==========================');
    
    try {
      const blogPath = path.join(process.cwd(), 'data/blog-posts.json');
      
      if (!fs.existsSync(blogPath)) {
        console.log('⚠️ blog-posts.json not found, skipping...');
        return { success: true, count: 0 };
      }

      const blogContent = fs.readFileSync(blogPath, 'utf8');
      const blogData = JSON.parse(blogContent);

      const posts = blogData.posts || [];
      console.log(`Found ${posts.length} blog posts to migrate`);

      if (posts.length === 0) {
        console.log('No blog posts to migrate');
        return { success: true, count: 0 };
      }

      const batch = writeBatch(db);
      let count = 0;

      for (const post of posts) {
        const postId = post.id || post.slug || `post_${count}`;
        const postData = {
          ...post,
          id: postId,
          migratedAt: new Date(),
          publishDate: post.publishDate ? new Date(post.publishDate) : new Date()
        };

        const docRef = doc(db, 'blog-posts', postId);
        batch.set(docRef, postData);
        count++;
      }

      await batch.commit();
      console.log(`✅ Successfully migrated ${count} blog posts`);
      return { success: true, count };

    } catch (error) {
      console.error('❌ Error migrating blog posts:', error);
      return { success: false, error: error.message };
    }
  },

  // 6. Customer Reviews Migration
  async reviews() {
    console.log('\n⭐ 6. MIGRATING CUSTOMER REVIEWS');
    console.log('=================================');
    
    try {
      const reviewsPath = path.join(process.cwd(), 'data/customer-reviews.json');
      
      if (!fs.existsSync(reviewsPath)) {
        console.log('⚠️ customer-reviews.json not found, skipping...');
        return { success: true, count: 0 };
      }

      const reviewsContent = fs.readFileSync(reviewsPath, 'utf8');
      const reviewsData = JSON.parse(reviewsContent);

      const reviews = reviewsData.reviews || [];
      console.log(`Found ${reviews.length} reviews to migrate`);

      if (reviews.length === 0) {
        console.log('No reviews to migrate');
        return { success: true, count: 0 };
      }

      const batch = writeBatch(db);
      let count = 0;

      for (const review of reviews) {
        const reviewId = `review_${review.id || count}`;
        const reviewData = {
          ...review,
          id: reviewId,
          migratedAt: new Date(),
          date: review.date ? new Date(review.date) : new Date()
        };

        const docRef = doc(db, 'reviews', reviewId);
        batch.set(docRef, reviewData);
        count++;
      }

      await batch.commit();
      console.log(`✅ Successfully migrated ${count} reviews`);
      return { success: true, count };

    } catch (error) {
      console.error('❌ Error migrating reviews:', error);
      return { success: false, error: error.message };
    }
  },

  // 7. Staff Credentials Migration
  async staff() {
    console.log('\n👥 7. MIGRATING STAFF CREDENTIALS');
    console.log('=================================');
    
    try {
      const staffPath = path.join(process.cwd(), 'staff-credentials.json');
      
      if (!fs.existsSync(staffPath)) {
        console.log('⚠️ staff-credentials.json not found, skipping...');
        return { success: true, count: 0 };
      }

      const staffContent = fs.readFileSync(staffPath, 'utf8');
      const staffData = JSON.parse(staffContent);

      const users = staffData.users || [];
      console.log(`Found ${users.length} staff members to migrate`);

      if (users.length === 0) {
        console.log('No staff to migrate');
        return { success: true, count: 0 };
      }

      const batch = writeBatch(db);
      let count = 0;

      for (const user of users) {
        const userId = user.username || `user_${count}`;
        const userData = {
          ...user,
          id: userId,
          migratedAt: new Date(),
          createdAt: new Date()
        };

        // Don't store plain text passwords in Firebase
        delete userData.password;

        const docRef = doc(db, 'staff', userId);
        batch.set(docRef, userData);
        count++;
      }

      await batch.commit();
      console.log(`✅ Successfully migrated ${count} staff members`);
      console.log('⚠️ Note: Passwords were not migrated for security reasons');
      return { success: true, count };

    } catch (error) {
      console.error('❌ Error migrating staff data:', error);
      return { success: false, error: error.message };
    }
  },

  // 8. Tasks Migration
  async tasks() {
    console.log('\n✅ 8. MIGRATING TASKS DATA');
    console.log('==========================');
    
    try {
      const tasksPath = path.join(process.cwd(), 'tasks.json');
      
      if (!fs.existsSync(tasksPath)) {
        console.log('⚠️ tasks.json not found, skipping...');
        return { success: true, count: 0 };
      }

      const tasksContent = fs.readFileSync(tasksPath, 'utf8');
      const tasksData = JSON.parse(tasksContent);

      const tasks = Array.isArray(tasksData) ? tasksData : tasksData.tasks || [];
      console.log(`Found ${tasks.length} tasks to migrate`);

      if (tasks.length === 0) {
        console.log('No tasks to migrate');
        return { success: true, count: 0 };
      }

      const batch = writeBatch(db);
      let count = 0;

      for (const task of tasks) {
        const taskId = task.id || `task_${count}`;
        const taskData = {
          ...task,
          id: taskId,
          migratedAt: new Date(),
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date()
        };

        const docRef = doc(db, 'tasks', taskId);
        batch.set(docRef, taskData);
        count++;
      }

      await batch.commit();
      console.log(`✅ Successfully migrated ${count} tasks`);
      return { success: true, count };

    } catch (error) {
      console.error('❌ Error migrating tasks:', error);
      return { success: false, error: error.message };
    }
  }
};

// Main migration function
async function runMigration() {
  console.log('🔥 Starting Complete Data Migration to Firebase');
  console.log('===============================================');
  
  const results = {};
  let totalMigrated = 0;
  let errors = [];

  // Run all migrations
  for (const [name, migrationFn] of Object.entries(migrations)) {
    try {
      const result = await migrationFn();
      results[name] = result;
      
      if (result.success) {
        totalMigrated += result.count;
      } else {
        errors.push(`${name}: ${result.error}`);
      }
    } catch (error) {
      errors.push(`${name}: ${error.message}`);
      results[name] = { success: false, error: error.message };
    }
  }

  // Create migration metadata
  try {
    const metadataRef = doc(db, 'admin', 'migration-metadata');
    const metadata = {
      totalItemsMigrated: totalMigrated,
      migrationResults: results,
      errors: errors,
      lastMigrated: new Date(),
      source: 'complete-migration-script',
      version: '2.0'
    };

    await setDoc(metadataRef, metadata);
    console.log('\n✅ Created migration metadata');
  } catch (error) {
    console.error('❌ Error creating metadata:', error);
  }

  // Summary
  console.log('\n🎉 MIGRATION COMPLETE!');
  console.log('======================');
  console.log(`📊 Total items migrated: ${totalMigrated}`);
  console.log('\n📋 Summary by collection:');
  
  for (const [name, result] of Object.entries(results)) {
    const status = result.success ? '✅' : '❌';
    const count = result.success ? result.count : 0;
    console.log(`  ${status} ${name}: ${count} items`);
  }

  if (errors.length > 0) {
    console.log('\n⚠️ Errors encountered:');
    errors.forEach(error => console.log(`  - ${error}`));
  }

  console.log('\n🔗 View your data at:');
  console.log('https://console.firebase.google.com/project/bloom-graden-cafe-user-login/firestore');
  
  process.exit(errors.length > 0 ? 1 : 0);
}

// Run the migration
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration, migrations };

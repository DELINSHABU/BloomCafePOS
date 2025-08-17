const fs = require('fs');
const path = require('path');

const INVENTORY_FILE_PATH = path.join(__dirname, '..', 'data', 'inventory.json');

// Read the current inventory data
function readInventoryData() {
  try {
    const fileContent = fs.readFileSync(INVENTORY_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading inventory data:', error);
    throw error;
  }
}

// Write updated inventory data
function writeInventoryData(data) {
  try {
    fs.writeFileSync(INVENTORY_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing inventory data:', error);
    throw error;
  }
}

// Update inventory schema
function updateInventorySchema() {
  console.log('Starting inventory schema update...');
  
  const data = readInventoryData();
  let updatedCount = 0;

  // Update each inventory item to include new payment fields if they don't exist
  data.inventory = data.inventory.map(item => {
    let needsUpdate = false;
    
    // Check if any of the new fields are missing
    if (item.isPaid === undefined) {
      item.isPaid = false;
      needsUpdate = true;
    }
    
    if (item.discountPercentage === undefined) {
      item.discountPercentage = 0;
      needsUpdate = true;
    }
    
    if (item.finalPrice === undefined) {
      item.finalPrice = item.unitPrice || 0;
      needsUpdate = true;
    }
    
    if (item.paymentMethods === undefined) {
      item.paymentMethods = [];
      needsUpdate = true;
    }
    
    if (item.qrCodeImage === undefined) {
      item.qrCodeImage = '';
      needsUpdate = true;
    }
    
    if (item.upiLink === undefined) {
      item.upiLink = '';
      needsUpdate = true;
    }
    
    if (item.supplierPhone === undefined) {
      item.supplierPhone = '';
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      updatedCount++;
      console.log(`Updated item: ${item.name} (ID: ${item.id})`);
    }
    
    return item;
  });

  // Update the lastUpdated timestamp
  data.lastUpdated = new Date().toISOString();
  data.updatedBy = 'schema-update-script';

  // Write the updated data back to the file
  writeInventoryData(data);
  
  console.log(`\nSchema update completed!`);
  console.log(`Total items: ${data.inventory.length}`);
  console.log(`Updated items: ${updatedCount}`);
  console.log(`Items already up-to-date: ${data.inventory.length - updatedCount}`);
}

// Run the update
try {
  updateInventorySchema();
} catch (error) {
  console.error('Failed to update inventory schema:', error);
  process.exit(1);
}

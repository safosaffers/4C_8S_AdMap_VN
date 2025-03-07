const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/adstructures'
});

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Read the JSON file
    const jsonPath = path.join(__dirname, '..', 'full_geo_data_with_lat_lon.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`Loaded ${jsonData.length} records from JSON file`);
    
    // Check if the table already has data
    const countResult = await pool.query('SELECT COUNT(*) FROM advertising_structures');
    const count = parseInt(countResult.rows[0].count);
    
    if (count > 0) {
      console.log(`Table already contains ${count} records. Skipping initialization.`);
      console.log('If you want to reinitialize, please truncate the table first.');
      return;
    }
    
    // Prepare batch insert
    console.log('Preparing data for insertion...');
    
    // Create a client from the pool
    const client = await pool.connect();
    
    try {
      // Start a transaction
      await client.query('BEGIN');
      
      // Insert data in batches
      const batchSize = 100;
      let inserted = 0;
      
      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batch = jsonData.slice(i, i + batchSize);
        
        for (const item of batch) {
          await client.query(
            `INSERT INTO advertising_structures (
              original_id, address, type, subtype, size, sides, total_area,
              placement_address, x_coord, y_coord, owner, page, note, latitude, longitude
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [
              item['№_Рк_по_схеме'] || null,
              item['Адрес_Рк'] || null,
              item['Вид_Рк'] || null,
              item['Тип_Рк'] || null,
              item['Размер_Рк'] || null,
              item['Кол_во_сторон_Рк'] || null,
              item['Общ_пл_инф_полей'] || null,
              item['Адрес_размещ_Рк'] || null,
              item['X'] || null,
              item['Y'] || null,
              item['Собст_или_владелец_Рк'] || null,
              item['Страница'] || null,
              item['Примечание'] || null,
              item['latitude'] || null,
              item['longitude'] || null
            ]
          );
          
          inserted++;
        }
        
        console.log(`Inserted ${inserted} of ${jsonData.length} records...`);
      }
      
      // Commit the transaction
      await client.query('COMMIT');
      console.log(`Successfully inserted ${inserted} records into the database.`);
      
    } catch (err) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      throw err;
    } finally {
      // Release the client back to the pool
      client.release();
    }
    
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the initialization
initializeDatabase(); 
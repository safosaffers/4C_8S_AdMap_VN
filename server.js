const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/adstructures'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes

// Get all advertising structures
app.get('/api/structures', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM advertising_structures ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching structures:', err);
    res.status(500).json({ error: 'Failed to fetch structures' });
  }
});

// Get a single advertising structure by ID
app.get('/api/structures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM advertising_structures WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Structure not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching structure:', err);
    res.status(500).json({ error: 'Failed to fetch structure' });
  }
});

// Create a new advertising structure
app.post('/api/structures', upload.single('image'), async (req, res) => {
  try {
    const {
      address, type, subtype, size, sides, owner, note, latitude, longitude, occupied
    } = req.body;
    
    // Get image URL if uploaded
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    const result = await pool.query(
      `INSERT INTO advertising_structures 
       (address, type, subtype, size, sides, owner, note, latitude, longitude, occupied, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [address, type, subtype, size, sides, owner, note, latitude, longitude, occupied === 'true', imageUrl]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating structure:', err);
    res.status(500).json({ error: 'Failed to create structure' });
  }
});

// Update an advertising structure
app.put('/api/structures/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      address, type, subtype, size, sides, owner, note, latitude, longitude, occupied
    } = req.body;
    
    // Get current structure to check if we need to update the image
    const currentStructure = await pool.query('SELECT * FROM advertising_structures WHERE id = $1', [id]);
    
    if (currentStructure.rows.length === 0) {
      return res.status(404).json({ error: 'Structure not found' });
    }
    
    // Determine image URL
    let imageUrl = currentStructure.rows[0].image_url;
    if (req.file) {
      // If there's a new image, update the URL
      imageUrl = `/uploads/${req.file.filename}`;
      
      // Delete old image if it exists
      if (currentStructure.rows[0].image_url) {
        const oldImagePath = path.join(__dirname, currentStructure.rows[0].image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    const result = await pool.query(
      `UPDATE advertising_structures 
       SET address = $1, type = $2, subtype = $3, size = $4, sides = $5, 
           owner = $6, note = $7, latitude = $8, longitude = $9, 
           occupied = $10, image_url = $11
       WHERE id = $12
       RETURNING *`,
      [address, type, subtype, size, sides, owner, note, latitude, longitude, 
       occupied === 'true', imageUrl, id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating structure:', err);
    res.status(500).json({ error: 'Failed to update structure' });
  }
});

// Toggle occupied status
app.patch('/api/structures/:id/toggle-occupied', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE advertising_structures 
       SET occupied = NOT occupied 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Structure not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error toggling occupied status:', err);
    res.status(500).json({ error: 'Failed to toggle occupied status' });
  }
});

// Delete an advertising structure
app.delete('/api/structures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the structure to check if it has an image
    const structure = await pool.query('SELECT * FROM advertising_structures WHERE id = $1', [id]);
    
    if (structure.rows.length === 0) {
      return res.status(404).json({ error: 'Structure not found' });
    }
    
    // Delete the image file if it exists
    if (structure.rows[0].image_url) {
      const imagePath = path.join(__dirname, structure.rows[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete the structure from the database
    await pool.query('DELETE FROM advertising_structures WHERE id = $1', [id]);
    
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting structure:', err);
    res.status(500).json({ error: 'Failed to delete structure' });
  }
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
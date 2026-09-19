const fs = require('fs');

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}




require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
console.log('DB URL loaded:', process.env.DATABASE_URL);






const multer = require('multer');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();



// Multer storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());

// Make uploaded photos accessible
app.use('/uploads', express.static('uploads'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is alive!' });
});

// Add a dog
app.post('/api/dogs', upload.single('photo'), async (req, res) => {
  try {
    const { name, breed, gender, vaccinated } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      'INSERT INTO dogs (name, breed, gender, vaccinated, photo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, breed, gender, vaccinated, photo]
    );

    const newDog = result.rows[0];
    res.json({ message: 'Dog added!', dog: newDog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get all dogs
app.get('/api/dogs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dogs ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
app.get('/api/dogs/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dogs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});

require('dotenv').config()
const { Pool } = require('pg')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')
const express = require('express')
const cors = require('cors')

const app = express()
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'street-dog-tracker', allowed_formats: ['jpg', 'png', 'jpeg'] },
})
const upload = multer({ storage })

app.use(cors())
app.use(express.json())

app.get('/api/dogs-nearby', async (req, res) => {
  const lat = Number(req.query.lat)
  const lng = Number(req.query.lng)
  if (req.query.lat === undefined || req.query.lng === undefined || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required.' })
  }

  try {
    const result = await pool.query(`
      SELECT dogs.*, sightings.latitude, sightings.longitude, sightings.seen_at,
      (6371 * acos(LEAST(1, GREATEST(-1,
        cos(radians($1)) * cos(radians(sightings.latitude)) *
        cos(radians(sightings.longitude) - radians($2)) +
        sin(radians($1)) * sin(radians(sightings.latitude))
      )))) AS distance_km
      FROM dogs
      JOIN sightings ON sightings.dog_id = dogs.id
      WHERE sightings.id IN (
        SELECT DISTINCT ON (dog_id) id FROM sightings ORDER BY dog_id, seen_at DESC
      )
      ORDER BY distance_km ASC
      LIMIT 10
    `, [lat, lng])
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.get('/api/test', (_req, res) => res.json({ message: 'Backend is alive!' }))

app.post('/api/dogs', upload.single('photo'), async (req, res) => {
  try {
    const { name, breed, gender, vaccinated } = req.body
    if (!name?.trim() || !breed?.trim() || !['male', 'female'].includes(gender) || !['yes', 'no'].includes(vaccinated)) {
      return res.status(400).json({ error: 'Name, breed, valid gender, and vaccination status are required.' })
    }
    const photo = req.file ? req.file.path : null
    const result = await pool.query(
      'INSERT INTO dogs (name, breed, gender, vaccinated, photo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name.trim(), breed.trim(), gender, vaccinated, photo],
    )
    res.status(201).json({ message: 'Dog added!', dog: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.get('/api/dogs', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dogs ORDER BY id DESC')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.get('/api/dogs/:id', async (req, res) => {
  try {
    const dogResult = await pool.query('SELECT * FROM dogs WHERE id = $1', [req.params.id])
    if (dogResult.rows.length === 0) return res.status(404).json({ error: 'Dog not found' })
    const sightingResult = await pool.query(
      'SELECT * FROM sightings WHERE dog_id = $1 ORDER BY seen_at DESC LIMIT 1',
      [req.params.id],
    )
    res.json({ ...dogResult.rows[0], lastSighting: sightingResult.rows[0] || null })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.post('/api/dogs/:id/sightings', async (req, res) => {
  try {
    const latitude = Number(req.body.latitude)
    const longitude = Number(req.body.longitude)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Valid latitude and longitude are required.' })
    }
    const result = await pool.query(
      'INSERT INTO sightings (dog_id, latitude, longitude) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, latitude, longitude],
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server running on port ${port}`))

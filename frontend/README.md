# 🐾 Pawfile / BarkBuddy — Street Dog ID & Tracker

A full-stack web app that gives street dogs a digital identity. Register a dog once, get a printable QR code for their collar — anyone who scans it can see the dog's details, vaccination status, and a crowd-sourced "last seen" location.

**Live demo:** https://street-dog-tracker.vercel.app

## Why I built this

Street dogs don't have owners tracking their whereabouts or health status, but local communities and NGOs often care for them informally. This project turns any smartphone into a way to identify a dog and report where it was last seen — no app install needed, just a QR code scan.

## Features

- 📋 Register a dog with name, breed, gender, vaccination status, and a hangout spot ("My Adda")
- 📸 Photo upload with live preview, stored on Cloudinary
- 🆔 Auto-generated QR code per dog, printable in a collar-tag-friendly size
- 🐕 Public profile page per dog — accessible only via their unique QR code / link
- 📍 Crowd-sourced location tracking — anyone who scans the QR code (with permission) logs a "last seen" sighting, shown with an embedded map
- 🗺️ "Dogs near you" — finds and sorts nearby registered dogs by distance using the Haversine formula
- 📱 Fully responsive, mobile-first design

## Tech stack

**Frontend:** React (Vite), React Router, deployed on Vercel
**Backend:** Node.js, Express, deployed on Render
**Database:** PostgreSQL (Neon)
**Photo storage:** Cloudinary
**Other:** Browser Geolocation API, QR code generation (qrcode.react)

## Architecture
React (Vercel) → Express API (Render) → PostgreSQL (Neon)
↘ Cloudinary (photos)


## How it works

1. Someone registers a dog through the form, uploading a photo and details
2. The backend saves the dog's info to PostgreSQL and the photo to Cloudinary
3. A QR code is generated client-side, encoding a unique link to that dog's profile
4. The QR code is printed and attached to the dog's collar
5. Anyone who scans it lands on a public profile page showing the dog's details
6. On page load, the visitor's location (if permitted) is logged as a new "sighting," updating the dog's last-known location

## Getting started locally

```bash
# Backend
cd backend
npm install
# add a .env file with DATABASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Future improvements

- Admin login so only verified volunteers can register dogs (currently open to anyone, by design, for community-driven use)
- Sighting history (not just the latest one) to show movement patterns over time
- Push notifications when a dog hasn't been seen in a while
- Offline-friendly PWA support for volunteers in low-connectivity areas

## What I learned

Building this taught me full-stack fundamentals end to end — React state management, REST API design, relational database schema design (including foreign keys between dogs and sightings), file uploads, third-party service integration (Cloudinary), browser geolocation, and deploying a multi-service app (separate frontend/backend/database hosts) with real production issues like CORS, environment variables, and SPA routing on a static host.
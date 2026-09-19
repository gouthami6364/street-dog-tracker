import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'

function DogProfile() {
  const { id } = useParams()
  const [dog, setDog] = useState(null)

  useEffect(() => {
    // Fetch dog details
    fetch(`https://street-dog-tracker.onrender.com/api/dogs/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch dog')
        }
        return response.json()
      })
      .then(data => {
        setDog(data)
      })
      .catch(error => {
        console.error('Error fetching dog:', error)
      })

    // Ask for location and log this sighting
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          fetch(
            `https://street-dog-tracker.onrender.com/api/dogs/${id}/sightings`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              })
            }
          )
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to record sighting')
              }
              return response.json()
            })
            .then(data => {
              console.log('Sighting recorded:', data)
            })
            .catch(error => {
              console.error('Error recording sighting:', error)
            })
        },
        error => {
          console.log(
            'Location permission denied or unavailable:',
            error.message
          )
        }
      )
    } else {
      console.log('Geolocation is not supported by this browser.')
    }
  }, [id])

 if (!dog) {
  return (
    <div className="page">
      <div className="loading-screen">
        <span className="spinner dark"></span>
        <p>Fetching this pup's Pawfile...</p>
        <p className="loading-hint">First load can take a moment if the server's waking up 🐾</p>
      </div>
    </div>
  );
}

 return (
  <div className="page">
    <div className="id-card">
      <div className="id-card-header">
        <span className="id-card-logo">🐾</span>
        <span className="id-card-title">BarkBuddy</span>
      </div>

      <div className="id-card-body">
        <div className="id-card-photo">
          {dog.photo && <img src={dog.photo} alt={dog.name} />}
        </div>

        <div className="id-card-details">
          <p className="id-label">Name</p>
          <p className="id-value">{dog.name}</p>

          <p className="id-label">Breed</p>
          <p className="id-value">{dog.breed}</p>

          <p className="id-label">Gender</p>
          <p className="id-value">{dog.gender}</p>

          <p className="id-label">Vaccination Status</p>
          <span className={`badge ${dog.vaccinated}`}>
            {dog.vaccinated === 'yes' ? 'Vaccinated' : 'Not vaccinated'}
          </span>
        </div>
      </div>

      <div className="id-card-footer">
        Registered Street Dog · ID #{dog.id}
      </div>
    </div>

    {dog.lastSighting && (
      <div className="dog-card-body" style={{ maxWidth: '340px', margin: '16px auto 0' }}>
        <p style={{ fontSize: '0.85rem', margin: '0 0 8px' }}>
          Last seen: {new Date(dog.lastSighting.seen_at).toLocaleString()}
        </p>
        <iframe
          title="last seen location"
          width="100%"
          height="200"
          style={{ border: 0, borderRadius: '10px' }}
          loading="lazy"
          src={`https://maps.google.com/maps?q=${dog.lastSighting.latitude},${dog.lastSighting.longitude}&z=15&output=embed`}
        ></iframe>
      </div>
    )}

    <div style={{ maxWidth: '340px', margin: '0 auto' }}>
      <Link to="/nearby" className="action-link secondary">
        🐾 Dogs near you
      </Link>
      <Link to="/" className="action-link primary">
        ➕ Add to Pawfile
      </Link>
    </div>
  </div>
)
}

export default DogProfile

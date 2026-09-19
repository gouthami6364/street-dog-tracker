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
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div
        className="dog-card"
        style={{ maxWidth: '320px' }}
      >
        {dog.photo && (
          <img
            src={dog.photo}
            alt={dog.name}
          />
        )}

        <div className="dog-card-body">
          <h2>{dog.name}</h2>

          <p>
            {dog.breed} · {dog.gender}
          </p>

          <span className={`badge ${dog.vaccinated}`}>
            {dog.vaccinated === 'yes'
              ? 'Vaccinated'
              : 'Not vaccinated'}
          </span>

          {dog.lastSighting && (
  <div style={{ marginTop: '12px' }}>
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
<Link to="/nearby" className="action-link secondary">
  🐾 Dogs near you
</Link>

<Link to="/" className="action-link primary">
  ➕ Register another dog
</Link>
        </div>
      </div>
    </div>
  )
}

export default DogProfile

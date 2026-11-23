import { useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'https://street-dog-tracker.onrender.com/api'

function NearbyDogs() {
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState('')

  const findNearbyDogs = () => {
    if (!navigator.geolocation) {
      setError('Location is not supported by this browser.')
      return
    }

    setLoading(true)
    setStarted(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = new URLSearchParams({ lat: String(coords.latitude), lng: String(coords.longitude) })
          const response = await fetch(`${API_URL}/dogs-nearby?${params}`)
          const data = await response.json()
          if (!response.ok) throw new Error(data.error || 'Could not load nearby dogs.')
          setDogs(data)
        } catch (requestError) {
          setError(requestError.message || 'Could not load nearby dogs.')
        } finally {
          setLoading(false)
        }
      },
      (locationError) => {
        setError(locationError.code === locationError.PERMISSION_DENIED
          ? 'Location permission was not granted. Allow location access to find nearby dogs.'
          : 'Could not get your location. Please try again.')
        setLoading(false)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
  }

  return (
    <main className="page">
      <header className="nearby-header">
        <h1>Dogs near you</h1>
        <p>Find recently seen dogs nearby. Your location is used only for this search.</p>
      </header>

      <div style={{ maxWidth: '420px', margin: '0 auto 20px' }}>
        <button type="button" className="action-link primary" onClick={findNearbyDogs} disabled={loading} style={{ width: '100%', border: 0, cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'Finding dogs…' : started ? 'Refresh nearby dogs' : 'Use my location'}
        </button>
        {error && <p role="alert" className="nearby-empty">{error}</p>}
      </div>

      {loading && <p className="nearby-loading">Searching for nearby dogs…</p>}
      {!loading && started && !error && dogs.length === 0 && <p className="nearby-empty">No recent dog sightings were found nearby.</p>}
      {!loading && dogs.length > 0 && (
        <section className="nearby-grid" aria-label="Nearby dogs">
          {dogs.map((dog) => (
            <Link to={`/dog/${dog.id}`} className="nearby-card" key={dog.id}>
              {dog.photo ? <img src={dog.photo} alt={dog.name} /> : <div className="nearby-empty" aria-label="No photo">🐾</div>}
              <span className="distance-pill">{Number(dog.distance_km).toFixed(1)} km</span>
              <div className="nearby-card-body">
                <h3>{dog.name}</h3>
                <p>{dog.breed || 'Breed unknown'}</p>
                {dog.seen_at && <p>Seen {new Date(dog.seen_at).toLocaleDateString()}</p>}
              </div>
            </Link>
          ))}
        </section>
      )}

      <div style={{ maxWidth: '420px', margin: '20px auto 0' }}>
        <Link to="/" className="action-link secondary">Back to Pawfile</Link>
      </div>
    </main>
  )
}

export default NearbyDogs

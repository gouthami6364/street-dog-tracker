import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://street-dog-tracker.onrender.com/api'

function DogProfile() {
  const { id } = useParams()
  const [dog, setDog] = useState(null)
  const [error, setError] = useState('')
  const [reporting, setReporting] = useState(false)
  const [sightingMessage, setSightingMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch(`${API_URL}/dogs/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error(response.status === 404 ? 'Dog profile not found.' : 'Could not load this dog profile.')
        return response.json()
      })
      .then((data) => { if (!cancelled) setDog(data) })
      .catch((fetchError) => { if (!cancelled) setError(fetchError.message || 'Could not load this dog profile.') })
    return () => { cancelled = true }
  }, [id])

  const reportSighting = () => {
    if (!navigator.geolocation) {
      setSightingMessage('Location is not supported by this browser.')
      return
    }

    setReporting(true)
    setSightingMessage('')
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(`${API_URL}/dogs/${id}/sightings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }),
          })
          const data = await response.json()
          if (!response.ok) throw new Error(data.error || 'Could not save the sighting. Please try again.')
          setDog((currentDog) => currentDog ? { ...currentDog, lastSighting: data } : currentDog)
          setSightingMessage('Sighting reported. Thank you for helping!')
        } catch (requestError) {
          setSightingMessage(requestError.message || 'Could not save the sighting.')
        } finally {
          setReporting(false)
        }
      },
      (locationError) => {
        setReporting(false)
        setSightingMessage(locationError.code === locationError.PERMISSION_DENIED
          ? 'Location permission was not granted; no sighting was reported.'
          : 'Could not get your location; no sighting was reported.')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 },
    )
  }

  if (error) {
    return <div className="page"><p className="nearby-empty" role="alert">{error}</p><Link to="/nearby" className="action-link secondary">Dogs near you</Link><Link to="/" className="action-link primary">Back to Pawfile</Link></div>
  }

  if (!dog) {
    return (
      <div className="page">
        <div className="loading-screen">
          <span className="spinner dark" />
          <p>Fetching this pup&apos;s Pawfile...</p>
          <p className="loading-hint">First load can take a moment if the server&apos;s waking up 🐾</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="id-card">
        <div className="id-card-header"><span className="id-card-logo">🐾</span><span className="id-card-title">BarkBuddy</span></div>
        <div className="id-card-body">
          <div className="id-card-photo">{dog.photo && <img src={dog.photo} alt={dog.name} />}</div>
          <div className="id-card-details">
            <p className="id-label">Name</p><p className="id-value">{dog.name}</p>
            <p className="id-label">Breed</p><p className="id-value">{dog.breed}</p>
            <p className="id-label">Gender</p><p className="id-value">{dog.gender}</p>
            <p className="id-label">Vaccination Status</p>
            <span className={`badge ${dog.vaccinated}`}>{dog.vaccinated === 'yes' ? 'Vaccinated' : 'Not vaccinated'}</span>
          </div>
        </div>
        <div className="id-card-footer">Registered Street Dog · ID #{dog.id}</div>
      </div>

      {dog.lastSighting && (
        <div className="dog-card-body" style={{ maxWidth: 340, margin: '16px auto 0' }}>
          <p style={{ fontSize: '0.85rem', margin: '0 0 8px' }}>Last reported: {new Date(dog.lastSighting.seen_at).toLocaleString()}</p>
          <iframe
            title="Last reported dog sighting location"
            width="100%"
            height="200"
            style={{ border: 0, borderRadius: 10 }}
            loading="lazy"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${dog.lastSighting.latitude},${dog.lastSighting.longitude}`)}&z=15&output=embed`}
          />
        </div>
      )}

      <div style={{ maxWidth: 340, margin: '0 auto' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', textAlign: 'center', margin: '16px 0 8px' }}>
          Viewing this profile does not share your location. Choose below only if you are reporting that you saw this dog.
        </p>
        <button type="button" onClick={reportSighting} disabled={reporting} className="action-link primary" style={{ width: '100%', border: 0, cursor: reporting ? 'wait' : 'pointer' }}>
          {reporting ? 'Getting location…' : '📍 I saw this dog — report sighting'}
        </button>
        {sightingMessage && <p role="status" style={{ fontSize: '0.85rem', textAlign: 'center', color: 'var(--muted)' }}>{sightingMessage}</p>}
        <Link to="/nearby" className="action-link secondary">🐾 Dogs near you</Link>
        <Link to="/" className="action-link primary">➕ Add to Pawfile</Link>
      </div>
    </div>
  )
}

export default DogProfile

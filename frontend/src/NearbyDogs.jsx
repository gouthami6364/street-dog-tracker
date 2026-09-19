import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function NearbyDogs() {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Location not supported on this device");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://street-dog-tracker.onrender.com/api/dogs-nearby?lat=${latitude}&lng=${longitude}`
        );
        const data = await response.json();
        setDogs(data);
        setLoading(false);
      },
      () => {
        setError("Location permission denied");
        setLoading(false);
      }
    );
  }, []);

 if (loading) {
  return (
    <div className="page">
      <div className="loading-screen">
        <span className="spinner dark"></span>
        <p>Sniffing out dogs near you...</p>
        <p className="loading-hint">First load can take a moment if the server's waking up 🐾</p>
      </div>
    </div>
  );
}

  if (error) {
    return (
      <div className="page">
        <p className="nearby-empty">{error}</p>
        <Link to="/" className="action-link primary" style={{ maxWidth: '340px', margin: '0 auto' }}>
          ➕ Add to Pawfile
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="nearby-header">
        <h2>🐾 My Friends</h2>
        <p>Sorted by distance from your current location</p>
      </div>

      {dogs.length === 0 ? (
        <p className="nearby-empty">No dogs found nearby yet.</p>
      ) : (
        <div className="nearby-grid">
          {dogs.map((dog) => (
            <Link to={`/dog/${dog.id}`} key={dog.id} className="nearby-card">
              <span className="distance-pill">{dog.distance_km.toFixed(1)} km</span>
              {dog.photo && <img src={dog.photo} alt={dog.name} />}
              <div className="nearby-card-body">
                <h3>{dog.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>
                  {dog.breed}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default NearbyDogs
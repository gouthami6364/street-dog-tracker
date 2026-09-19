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

  if (loading) return <div className="page"><p>Finding dogs near you...</p></div>;
  if (error) return <div className="page"><p>{error}</p></div>;

  return (
    <div className="page">
      <h2>Dogs near you</h2>
      {dogs.length === 0 && <p>No dogs found nearby yet.</p>}
      <div className="dog-grid">
        {dogs.map((dog) => (
          <Link to={`/dog/${dog.id}`} key={dog.id} className="dog-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            {dog.photo && <img src={dog.photo} alt={dog.name} />}
            <div className="dog-card-body">
              <h2>{dog.name}</h2>
              <p>{dog.distance_km.toFixed(1)} km away</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default NearbyDogs
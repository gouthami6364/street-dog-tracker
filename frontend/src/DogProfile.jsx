import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

function DogProfile() {
  const { id } = useParams();
  const [dog, setDog] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/dogs/${id}`)
      .then(response => response.json())
      .then(data => {
        setDog(data);
      });
  }, [id]);

  if (!dog) {
    return <div className="page"><p>Loading...</p></div>;
  }

  return (
    <div className="page">
      <div className="dog-card" style={{ maxWidth: '320px' }}>
        {dog.photo && (
          <img src={`http://localhost:5000${dog.photo}`} alt={dog.name} />
        )}
        <div className="dog-card-body">
          <h2>{dog.name}</h2>
          <p>{dog.breed} · {dog.gender}</p>
          <span className={`badge ${dog.vaccinated}`}>
            {dog.vaccinated === 'yes' ? 'Vaccinated' : 'Not vaccinated'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default DogProfile
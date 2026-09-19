import { QRCodeCanvas } from 'qrcode.react'
import { useState, useRef } from 'react'

function AddDog() {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setgender] = useState("male");
  const [vaccinated, setVaccinated] = useState("no");
  const [addedDog, setAddedDog] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('breed', breed);
    formData.append('gender', gender);
    formData.append('vaccinated', vaccinated);
    if (photo) {
      formData.append('photo', photo);
    }

    const response = await fetch('https://street-dog-tracker.onrender.com/api/dogs', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    setAddedDog(data.dog);
    console.log(data);

    setName("");
    setBreed("");
    setgender("male");
    setVaccinated("no");
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="page">
      <form className="add-dog-form" onSubmit={handleSubmit}>
        <h2>Add a dog</h2>

        <div className="photo-box" onClick={() => fileInputRef.current.click()}>
          {photoPreview ? (
            <img src={photoPreview} alt="preview" />
          ) : (
            <span>Click to add photo</span>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handlePhotoChange}
          style={{ display: 'none' }}
        />

        <input
          type="text"
          placeholder="Dog name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Breed"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
        />
        <select value={gender} onChange={(e) => setgender(e.target.value)}>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
        <select value={vaccinated} onChange={(e) => setVaccinated(e.target.value)}>
          <option value="yes">Vaccinated</option>
          <option value="no">Not Vaccinated</option>
        </select>
        <button type="submit">Add Dog</button>
      </form>

      {addedDog && (
        <div className="qr-box">
          <p>QR code for {addedDog.name}:</p>
          <QRCodeCanvas value={`https://street-dog-tracker.vercel.app/dog/${addedDog.id}`} size={180} />
<p className="qr-link">https://street-dog-tracker.vercel.app/dog/{addedDog.id}</p>
        </div>
      )}
    </div>
  )
}

export default AddDog
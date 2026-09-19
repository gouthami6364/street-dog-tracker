import { QRCodeCanvas } from 'qrcode.react'
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

function AddDog() {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setgender] = useState("male");
  const [vaccinated, setVaccinated] = useState("no");
  const [addedDog, setAddedDog] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const qrRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

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
    

    setName("");
    setBreed("");
    setgender("male");
    setVaccinated("no");
    setPhoto(null);
    setPhotoPreview(null);
    setSubmitting(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

 const handlePrintQR = () => {
  const canvas = qrRef.current.querySelector('canvas');
  const imageUrl = canvas.toDataURL('image/png');

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>${addedDog.name}'s QR Code</title>
        <style>
          @page {
            size: 5cm 5cm;
            margin: 0;
          }
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            font-family: sans-serif;
          }
          img {
            width: 3cm;
            height: 3cm;
          }
          p {
            margin-top: 4px;
            font-size: 10px;
            font-weight: bold;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <img src="${imageUrl}" />
        <p>${addedDog.name}</p>
      </body>
    </html>
  `);
  printWindow.document.close();
};
  return (
    <div className="page">
      <form className="add-dog-form" onSubmit={handleSubmit}>
        <h2>Pawfile 🐾</h2>

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
          required
        />
        <input
          type="text"
          placeholder="Breed"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          required
        />
        <select value={gender} onChange={(e) => setgender(e.target.value)}>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
        <select value={vaccinated} onChange={(e) => setVaccinated(e.target.value)}>
          <option value="yes">Vaccinated</option>
          <option value="no">Not Vaccinated</option>
        </select>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Dog'}
        </button>
      </form>

      {addedDog && (
  <div className="qr-box">
    <p>{addedDog.name}'s Pawfile QR code:</p>
    <div ref={qrRef}>
      <QRCodeCanvas value={`https://street-dog-tracker.vercel.app/dog/${addedDog.id}`} size={180} />
    </div>
    <p className="qr-link">https://street-dog-tracker.vercel.app/dog/{addedDog.id}</p>
    <button type="button" onClick={handlePrintQR} className="action-link primary" style={{ border: 'none', cursor: 'pointer', marginTop: '10px' }}>
      🖨️ Print QR Code
    </button>
  </div>
)}
    </div>
  )
}

export default AddDog
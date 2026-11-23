import { QRCodeCanvas } from 'qrcode.react'
import { useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://street-dog-tracker.onrender.com/api'
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://street-dog-tracker.vercel.app'

function AddDog() {
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const fileInputRef = useRef(null)
  const qrRef = useRef(null)
  const [name, setName] = useState('')
  const [breed, setBreed] = useState('')
  const [gender, setGender] = useState('male')
  const [vaccinated, setVaccinated] = useState('no')
  const [addedDog, setAddedDog] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('breed', breed.trim())
      formData.append('gender', gender)
      formData.append('vaccinated', vaccinated)
      if (photo) formData.append('photo', photo)

      const response = await fetch(`${API_URL}/dogs`, { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not add this dog. Please try again.')
      if (!data.dog?.id) throw new Error('The server response was missing the new dog profile.')

      setAddedDog(data.dog)
      setName('')
      setBreed('')
      setGender('male')
      setVaccinated('no')
      setPhoto(null)
      setPhotoPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (requestError) {
      setError(requestError.message || 'Could not add this dog. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const profileUrl = addedDog ? `${SITE_URL}/dog/${addedDog.id}` : ''

  const handlePrintQR = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const imageUrl = canvas.toDataURL('image/png')
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setError('Please allow pop-ups to print the QR code.')
      return
    }
    printWindow.document.write(`<!doctype html><html><head><title>${addedDog.name} QR Code</title><style>@page{size:5cm 5cm;margin:0}body{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif}img{width:3cm;height:3cm}p{margin-top:4px;font-size:10px;font-weight:bold;text-align:center}</style></head><body><img src="${imageUrl}" alt="QR code"/><p>${addedDog.name}</p></body></html>`)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      alert('Link copied!')
    } catch {
      alert('Could not copy link. Please copy the URL shown below.')
    }
  }

  return (
    <div className="page">
      <form className="add-dog-form" onSubmit={handleSubmit}>
        <h2>Pawfile 🐾</h2>
        <div className="photo-box" onClick={() => fileInputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click() }}>
          {photoPreview ? <img src={photoPreview} alt="Selected dog preview" /> : <span>Click to add photo</span>}
        </div>
        <input type="file" accept="image/jpeg,image/png" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} />
        <input type="text" placeholder="Dog name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} />
        <input type="text" placeholder="Breed" value={breed} onChange={(event) => setBreed(event.target.value)} required maxLength={100} />
        <select value={gender} onChange={(event) => setGender(event.target.value)}>
          <option value="female">Female</option><option value="male">Male</option>
        </select>
        <select value={vaccinated} onChange={(event) => setVaccinated(event.target.value)}>
          <option value="yes">Vaccinated</option><option value="no">Not Vaccinated</option>
        </select>
        {error && <p role="alert" className="nearby-empty">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? <><span className="spinner" />Adding...</> : 'Add Dog'}
        </button>
      </form>

      {addedDog && (
        <div className="qr-box">
          <p>{addedDog.name}&apos;s Pawfile QR code:</p>
          <div ref={qrRef}><QRCodeCanvas value={profileUrl} size={180} /></div>
          <p className="qr-link">{profileUrl}</p>
          <button type="button" onClick={handleCopyLink} className="action-link secondary" style={{ border: 0, cursor: 'pointer', marginTop: 8 }}>Copy Link</button>
          <button type="button" onClick={handlePrintQR} className="action-link primary" style={{ border: 0, cursor: 'pointer', marginTop: 8 }}>Print QR Code</button>
        </div>
      )}
    </div>
  )
}

export default AddDog

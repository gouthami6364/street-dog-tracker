import { Routes, Route } from 'react-router-dom'
import AddDog from './AddDog'
import DogProfile from './DogProfile'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AddDog />} />
      <Route path="/dog/:id" element={<DogProfile />} />
    </Routes>
  )
}

export default App
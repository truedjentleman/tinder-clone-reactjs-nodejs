import { BrowserRouter, Route, Routes } from 'react-router-dom'


import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Home />}/>
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/onboarding" element={<Onboarding />}/>
      </Routes>
    </BrowserRouter>
    
  );
}

export default App;

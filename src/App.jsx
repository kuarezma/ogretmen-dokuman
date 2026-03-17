import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import AuthCallback from './pages/AuthCallback';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/confirm" element={<AuthCallback />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;


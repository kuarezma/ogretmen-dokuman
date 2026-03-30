import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import Requests from './pages/Requests';
import Forum from './pages/Forum';
import AiGenerator from './pages/AiGenerator';
import AuthCallback from './pages/AuthCallback';
import DocumentPreviewPage from './pages/DocumentPreviewPage';
import './App.css';
import DynamicBackground from './components/DynamicBackground';

function App() {
  return (
    <Router>
      <DynamicBackground />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/ai-generator" element={<AiGenerator />} />
          <Route path="/preview/:id" element={<DocumentPreviewPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/confirm" element={<AuthCallback />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;

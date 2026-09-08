import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import Signup from './components/Signup';
import NoteState from './context/notes/NoteState';
import Alert from './components/Alert';

function App() {
  const [alert, setAlert] = useState(null);

  // Initialise theme from localStorage, default to dark
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Apply theme to <html> whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3500);
  };

  return (
    <NoteState>
      <Router>
        <Navbar showAlert={showAlert} theme={theme} toggleTheme={toggleTheme} />
        <Alert alert={alert} />
        <div className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                localStorage.getItem('token')
                  ? <Home showAlert={showAlert} />
                  : <Navigate to="/login" />
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login showAlert={showAlert} />} />
            <Route path="/signup" element={<Signup showAlert={showAlert} />} />
          </Routes>
        </div>
      </Router>
    </NoteState>
  );
}

export default App;

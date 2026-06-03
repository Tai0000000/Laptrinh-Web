import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Blank from './pages/Blank';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Blank />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './index.js';
import BeautyProductWebsite from './BeautyProductWebsite';
import Toast from './Toast';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/beauty-products" element={<BeautyProductWebsite />} />
        <Route path="/toast" element={<Toast />} />
      </Routes>
    </Router>
  );
};
 
export default App;
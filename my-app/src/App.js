import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './index.js';
import BeautyProductWebsite from './BeautyProductWebsite';
import './App.css';

const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/beauty-products" element={<BeautyProductWebsite />} />
      </Routes>
    </Router>
  );
};
 
export default App;
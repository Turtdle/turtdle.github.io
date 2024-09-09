import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim"; 
import ReactDOM from 'react-dom';
import App from './App';

const Home = () => {
  const navigate = useNavigate();
  const particlesInit = useCallback(async engine => {
    console.log(engine);
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async container => {
    await console.log(container);
  }, []);

  const handleExploreClick = () => {
    navigate('/beauty-products');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <Particles
  options={{
    particles: {
      number: {
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "star",
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  }}
  className="absolute inset-0 z-0"
/>

<div className="text-center z-10 relative">
  <h1 className="text-5xl font-bold text-gray-800 mb-6">
    Welcome
  </h1>
  <p className="text-xl text-gray-700 mb-8">
    Here is the directory.
  </p>
</div>
    </div>  
  );
};

export default Home;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
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
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "#000000", // Fallback color
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
            },
            modes: {
              repulse: {
                distance: 150,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
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
        <button
          onClick={handleExploreClick}
          className="bg-gray-800 text-white font-bold py-3 px-6 rounded-full text-lg hover:bg-gray-700 transition duration-300"
        >
          Placeholder 
        </button>
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
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
<<<<<<< HEAD
              value: "#0d47a1", // Blue background color
=======
              value: "#000000", // Fallback color
>>>>>>> temp
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
<<<<<<< HEAD
              onClick: {
                enable: true,
                mode: "push",
              },
=======
>>>>>>> temp
              onHover: {
                enable: true,
                mode: "repulse",
              },
<<<<<<< HEAD
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
=======
            },
            modes: {
              repulse: {
                distance: 150,
>>>>>>> temp
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
<<<<<<< HEAD
              opacity: 0.5,
=======
              opacity: 0.2,
>>>>>>> temp
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
<<<<<<< HEAD
              speed: 6,
=======
              speed: 1,
>>>>>>> temp
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
<<<<<<< HEAD
              type: "circle",
=======
              type: "star",
>>>>>>> temp
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
<<<<<<< HEAD
          Here is the directory
=======
          Here is the directory.
>>>>>>> temp
        </p>
        <button
          onClick={handleExploreClick}
          className="bg-gray-800 text-white font-bold py-3 px-6 rounded-full text-lg hover:bg-gray-700 transition duration-300"
        >
          Placeholder 
        </button>
      </div>
<<<<<<< HEAD
    </div>
=======
    </div>  
>>>>>>> temp
  );
};

export default Home;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
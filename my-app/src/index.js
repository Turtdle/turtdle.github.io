import React, { useCallback, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim"; 
import ReactDOM from 'react-dom';
import App from './App';
import './BeautyProductWebsite';
import './index.css';
const Home = () => {
  const onWebsiteLoad = () => {
    console.log('Website loaded');
    // Add any other logic you want to run on load 1
  };

  // Use useEffect to run the function when the component mounts
  useEffect(() => {
    onWebsiteLoad();
    //onWebsiteLoadBeautyProductWebsite();
  }, []);
  const navigate = useNavigate();
  const [pageCode, setPageCode] = useState('');

  const particlesInit = useCallback(async engine => {
    console.log(engine);
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async container => {
    await console.log(container);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pageCode === 'proto') {
      navigate('/beauty-products');
    } else if (pageCode.toLowerCase() === 'nhung') {
      window.location.href = 'https://www.linkedin.com/in/nathan-hung-3a7a00229/';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative z+100 relative">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "#131862", // Fallback color
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
      />

      <div className="text-center z-10 relative">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Welcome
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Here is the directory.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={pageCode}
            onChange={(e) => setPageCode(e.target.value)}
            placeholder="Enter page code"
            className="bg-white text-gray-800 font-bold py-3 px-6 rounded-full text-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            type="Submit"
            className="bg-gray-800 text-white font-bold py-3 px-6 rounded-full text-lg hover:bg-gray-700 transition duration-300 ml-4"
          >
            Submit
          </button>
        </form>
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
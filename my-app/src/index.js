import React, { useCallback, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim"; 
import ReactDOM from 'react-dom';
import App from './App';
import './BeautyProductWebsite';
import { Linkedin } from 'lucide-react'; 
import { Github } from 'lucide-react';
import { Mail } from 'lucide-react';
import { Instagram, Keyboard} from 'lucide-react';
import './index.css';
const Home = () => {
  const navigate = useNavigate();
  const [pageCode, setPageCode] = useState('');

  useEffect(() => {
    console.log('Website loaded');
    // Add any other logic you wa        nt to run on load
  }, []);

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
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: "url('bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      <Particles
        className="absolute inset-0 z-10"
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            opacity: 0,
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

      <div className="text-center z-20 relative">
        <h1 className="text-5xl font-bold text-white mb-6">
          Welcome
        </h1>
        <p className="text-xl text-white mb-4">
          Enter page code or click on the links below
        </p>
        <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg mb-6 flex justify-center items-center">
          <a href="https://www.linkedin.com/in/samuel-wan-384a45222/" target="_blank" rel="noopener noreferrer" className="mx-2">
            <Linkedin size={24} color="white" />
          </a>
          <a href="https://github.com/Turtdle" target="_blank" rel="noopener noreferrer" className="mx-2">
            <Github size={24} color="white" />
          </a>
          <a href="mailto:sam@wanfamily.org" target="_blank" rel="noopener noreferrer" className="mx-2">
            <Mail size={24} color="white" />
          </a>
          <a href="https://www.instagram.com/sam.wan__" target="_blank" rel="noopener noreferrer" className="mx-2">
            <Instagram size={24} color="white" />
          </a>
          <a href="https://monkeytype.com/profile/Tourt/" target="_blank" rel="noopener noreferrer" className="mx-2">
            <Keyboard size={24} color="white" />
          </a>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <input
            type="text"
            value={pageCode}
            onChange={(e) => setPageCode(e.target.value)}
            placeholder="Enter page code"
            className="bg-white text-gray-800 font-bold py-2 px-4 rounded-full text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 mb-2 w-64"
          />
          <button
            type="submit"
            className="bg-gray-800 text-white font-bold py-2 px-4 rounded-full text-base hover:bg-gray-700 transition duration-300"
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
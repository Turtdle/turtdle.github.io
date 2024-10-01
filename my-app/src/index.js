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
import { Instagram, Keyboard, ChevronRight, ChevronLeft } from 'lucide-react';
import './index.css';
const GitHubCard = ({ username, width }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//cdn.jsdelivr.net/github-cards/latest/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div 
      className="github-card" 
      data-github={username} 
      data-width={width} 
      data-height="" 
      data-theme="default"
    ></div>
  );
};
const Home = () => {
  const navigate = useNavigate();
  const [pageCode, setPageCode] = useState('');
  const [isPopoutOpen, setIsPopoutOpen] = useState(false);

  useEffect(() => {
    console.log('Website loaded');
    // Add any other logic you want to run on load
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

  const togglePopout = () => {
    setIsPopoutOpen(!isPopoutOpen);
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
          <a href="https://www.linkedin.com/in/samuel-c-wan/" target="_blank" rel="noopener noreferrer" className="mx-2">
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
          <a href="https://leetcode.com/u/tourt/" target="_blank" rel="noopener noreferrer" className="mx-2">
            <img src="https://img.icons8.com/color/48/000000/leetcode.png" alt="LeetCode" className="w-6 h-6"/>
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

       {/* Updated Popout with GitHub Card */}
      <div 
        className={`fixed left-0 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${isPopoutOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{zIndex: 30}}
      >
        <div className="bg-white p-4 rounded-r-lg shadow-lg" style={{width: '400px', minHeight: '200px'}}>
          <h2 className="text-xl font-bold mb-4">GitHub</h2>
          <GitHubCard username="Turtdle" width={350} />
          <GitHubCard username="Turtdle/Game4" width={350} />
          <GitHubCard username="Turtdle/Ctfs" width={350} />
          <GitHubCard username="Turtdle/Starcraft2AI" width={350} />
          <GitHubCard username="Turtdle/QuantumComputerSim" width={350} />
        </div>
      </div>

      {/* Updated Arrow button */}
      <button 
        onClick={togglePopout}
        className={`fixed top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-90 p-2 rounded-lg hover:bg-opacity-100 transition-all duration-300 ${
          isPopoutOpen ? 'left-[400px]' : 'left-0 rounded-l-none'
        }`}
        style={{zIndex: 40}}
      >
        <ChevronLeft
          size={24}
          color="white"
          className={`transform transition-transform duration-300 ${isPopoutOpen ? 'rotate-180' : ''}`}
        />
      </button>
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
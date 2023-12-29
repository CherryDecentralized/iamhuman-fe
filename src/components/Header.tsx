import React, { useState, useEffect } from 'react';
import '../style/Header.css';
import Logo from './Logo'; // Import your existing Logo component
import Navbar from './Navbar'; // Import your existing Navbar component

const GoFundMeButton: React.FC = () => (
  <button className="gofundme-button">
    Support Us
  </button>
);

const Header: React.FC = () => {
  const [isNavbarFixed, setIsNavbarFixed] = useState<boolean>(true);

  useEffect(() => {
    const handleScroll = () => {
        // Assuming each frame is 100vh in height
        if (window.scrollY > window.innerHeight * 2) {
            setIsNavbarFixed(false);
        } else {
            setIsNavbarFixed(true);
        }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  const isMobile = window.innerWidth <= 768;
  if(!isMobile) {
    return (
      <div className="header-container-inside">
        <div className="header-logo">
          <Logo />
        </div>
        <div className="header-navbar">
          <Navbar />
        </div>
        <div className="header-gofundme">
          <GoFundMeButton />
        </div>
      </div>
    );
  } else {
    return (
      <div className="header-container-inside">
        <div className="header-logo">
          <Logo />
        </div>
        <div className="header-navbar">
          <Navbar />
        </div>
      </div>
    );
  }
};

export default Header;

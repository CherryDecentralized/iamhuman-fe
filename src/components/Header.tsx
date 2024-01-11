import React, { useState, useEffect } from 'react';
import '../style/Header.css';
import Logo from './Logo'; // Import your existing Logo component
import Navbar from './Navbar'; // Import your existing Navbar component

const GoFundMeButton: React.FC = () => (
  <button className="gofundme-button">
    Support Us
  </button>
);

interface HeaderProps {
  onNavClick: (componentName: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavClick }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const handleLogoClick = () => {
    onNavClick('home');
  };
  useEffect(() => {

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  if(!isMobile) {
    return (
      <div className="header-container-inside">
        <div className="header-logo">
          <Logo onClick={handleLogoClick}/>
        </div>
        <div className="header-navbar">
          <Navbar onNavClick={onNavClick} />
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
          <Logo onClick={handleLogoClick} />
        </div>
        <div className="header-navbar">
          <Navbar onNavClick={onNavClick} />
        </div>
      </div>
    );
  }
};

export default Header;

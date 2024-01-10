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
  const [isNavbarFixed, setIsNavbarFixed] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const handleLogoClick = () => {
    onNavClick('home');
  };
  useEffect(() => {
    const handleScroll = () => {
        // Assuming each frame is 100vh in height
        if (window.scrollY > window.innerHeight * 2) {
            setIsNavbarFixed(false);
        } else {
            setIsNavbarFixed(true);
        }
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('scroll', handleScroll);
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

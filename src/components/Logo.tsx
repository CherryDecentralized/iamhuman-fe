import React, { useState } from 'react';
import '../style/Logo.css';
import logoImage from '../assets/Logo.svg'; // Use import instead of require

interface LogoProps {
  onClick: () => void;
}

const Logo: React.FC<LogoProps> = ({ onClick }) => {

  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onClick();
    setTimeout(() => setIsClicked(false), 200); // Reset after 200ms
  };
  
  return (
    <div 
    className={`logo-container ${isClicked ? 'logo-clicked' : ''}`}  
    onClick={handleClick}>
      <img src={logoImage} alt="Logo" className="logo-image" />
      <div className="logo-text"> <span>iamhuman</span><span className="logo-text-network">.network</span></div>
    </div>
  );
};

export default Logo;

import React from 'react';
import '../style/Logo.css';
import logoImage from '../assets/Logo.svg'; // Use import instead of require


const Logo: React.FC = () => {
  return (
    <div className="logo-container">
      <img src={logoImage} alt="Logo" className="logo-image" />
      <div className="logo-text"> <span>iamhuman</span><span className="logo-text-network">.network</span></div>
    </div>
  );
};

export default Logo;

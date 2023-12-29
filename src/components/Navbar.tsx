import React, { useRef, useState } from 'react';
import '../style/Navbar.css';
import '../assets/hamburgers.css';
import BurgerMenu from '../assets/burgermenu.svg';

interface NavItemProps {
  text: string;
  destinationId?: string;
  url?: string;
}

interface NavbarProps {
  onNavClick: (componentName: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ text, destinationId, url }) => {
  const handleItemClick = (itemId: string) => {
    setCurrentPage(itemId);
    onNavClick(itemId);
  };

  return (
    <div className="navbar-item" onClick={handleClick}>
      {url ? <a href={url}>{text}</a> : text}
    </div>
  );
};

const menuItems = [
  { label: "Home", id: "home" },
  { label: "The Ecosystem", id: "ecosystem" },
  { label: "Our Mission", id: "mission" },
  { label: "Statistics", id: "statistics" },
];

const Overlay = ({ isVisible, children }) => {
  const overlayClass = `overlay ${isVisible ? 'visible' : ''}`;
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.5s',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5 // Below burger menu
  };

  return (
    <div className={overlayClass} style={overlayStyle}>
      {children}
    </div>
  );
};


const scrollToSection = (destinationId: string) => {
  const section = document.getElementById(destinationId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};

const Navbar: React.FC = () => {

  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const menuButtonRef = useRef(null);
  const [currentPage, setCurrentPage] = useState("home");

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
    if (menuButtonRef.current) {
      menuButtonRef.current.classList.toggle('opened');
      menuButtonRef.current.setAttribute('aria-expanded', menuButtonRef.current.classList.contains('opened'));
    }
  };

  const isMobile = window.innerWidth <= 768;
  if(!isMobile) {
    return (
      <nav className="navbar-container">
        <NavItem text="STATISTICS" destinationId="" />
        <NavItem text="OUR MISSION" url="/cause-network" />
        <NavItem text="THE ECOSYSTEM" destinationId="" />
      </nav>
    );
  } else {
    return(
      <div className="burger-menu">
        <button className="menu" onClick={toggleMenu} ref={menuButtonRef}>
          <svg width="50" height="50" viewBox="0 0 100 100">
            <path className="line line1" d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058" />
            <path className="line line2" d="M 20,50 H 80" />
            <path className="line line3" d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942" />
          </svg>
      </button>
      <Overlay isVisible={isMenuOpen}>
        <nav>
          {menuItems.map(item => (
            <div 
              key={item.id} 
              className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}>
              {item.label}
            </div>
          ))}
        </nav>
      </Overlay>
     </div>
    );
  }
};

export default Navbar;

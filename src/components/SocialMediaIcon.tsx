import { useState } from "react";
import '../style/SocialMediaComponent.css'; // Create and import the CSS file for styling

const SocialMediaIcon: React.FC  = ({ IconComponent, link }) => {
    const [isClicked, setIsClicked] = useState(false);
  
    const handleClick = () => {
      setIsClicked(true);
      window.open(link, '_blank');
      setTimeout(() => setIsClicked(false), 300);
    };
  
    return (
      <div className={`social-media-icon ${isClicked ? 'icon-clicked' : ''}`} onClick={handleClick}>
        <IconComponent />
      </div>
    );
  };

  export default SocialMediaIcon;
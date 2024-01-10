import React, { useState } from 'react';
import '../style/SocialMediaComponent.css'; // Create and import the CSS file for styling
import { ReactComponent as TwitchIcon } from '../assets/twitch-icon.svg'; // Replace with actual SVG imports
import { ReactComponent as InstagramIcon } from '../assets/instagram-icon.svg';
import { ReactComponent as PatreonIcon } from '../assets/patreon-icon.svg';
import { ReactComponent as TiktokIcon } from "../assets/tiktok.svg"
import { ReactComponent as GithubIcon } from "../assets/github.svg"
import SocialMediaIcon from './SocialMediaIcon';


const SocialMediaBar: React.FC = () => {
  return (
    <div className="social-media-bar">
      <SocialMediaIcon IconComponent={TiktokIcon} link="https://www.tiktok.com/@newearthrevolution" />
      <SocialMediaIcon IconComponent={TwitchIcon} link="https://www.twitch.tv/newearthrevolution" />
      <SocialMediaIcon IconComponent={InstagramIcon} link="https://www.instagram.com/newearthrevolution/" />
      <SocialMediaIcon IconComponent={PatreonIcon} link="https://www.patreon.com/SaharBarak/" />
      <SocialMediaIcon IconComponent={GithubIcon} link="https://github.com/NewEarthRevolution" />
    </div>
  );
};

export default SocialMediaBar;

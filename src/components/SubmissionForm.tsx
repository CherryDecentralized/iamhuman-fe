import React, { useState } from 'react';
import axios from 'axios';
import '../style/SubmissionForm.css';
import '../style/transition.css';
import FormDividerMobile from '../assets/form-divider-mobile.svg';
import FormDividerDesktop from '../assets/form-divider-desktop.svg';

interface ICountry {
  countryName: string;
  countryCodeISO: string;
}


interface SubmissionFormProps {
  OnSubmitPledge: (pledgeData: {
    name: string;
    email: string;
    location: {
      countryCodeISO: string;
      countryName: string;
    };
  }) => void;
}

const getLocationFromIp = async (): Promise<ICountry | null> => {
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const ip = ipData.ip;

    const response = await fetch(`https://api.iplocation.net/?ip=${ip}`);
    const data = await response.json();

    return data && data.country_name && data.country_code2 ? {
      countryName: data.country_name,
      countryCodeISO: data.country_code2,
    } : null;
  } catch (error) {
    console.error(`Error fetching IP location: ${error}`);
    return null;
  }
};

const SubmissionForm: React.FC<SubmissionFormProps> = ({ OnSubmitPledge }) => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [animate, setAnimate] = useState(false);
  const [subject, setSubject] = useState<string>('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnimate(true);

    try {
      const location = await getLocationFromIp();
      if (!location) throw new Error('Unable to fetch location data');

      const pledgeData = {
        name: fullName,
        email: email,
        location: {
          countryCodeISO: location.countryCodeISO,
          countryName: location.countryName,
        },
      };

      const response = await axios.post(`${process.env.REACT_APP_GLOBE_SUBMISSION_URL}`, pledgeData);
      console.log(response.data);
      OnSubmitPledge(pledgeData);
    } catch (error) {
      console.error('Error submitting pledge:', error);
    }
  };

  // Determine if the app is running on a mobile device based on screen width
  const formClass = `form-container-mobile ${animate ? 'ld ld-flip-v-out' : ''}`;
  const formClassDesktop = `form-container ${animate ? 'ld ld-flip-v-out' : ''}`;

  const isMobile = window.innerWidth <= 768;
  if(!isMobile) {
  return (
      <div className={formClassDesktop}>
        <form className="form-container-in" onSubmit={handleSubmit}>
          <div className="field">
            <input className="fullName-input" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" />
            <div className="form-divider">
              <img src={FormDividerDesktop} alt="Desktop Divider" />
            </div>
          </div>
          <div className="field">
            <input className="email-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
            <div className="form-divider">
              <img src={FormDividerDesktop} alt="Desktop Divider" />
            </div>
          </div>
          <div className="field">
            <div className="subject-input"> I am human and I want peace </div>
          </div>
          <button className="signup-button" type="submit">Sign Up</button>
        </form>
      </div> 
    );
  }
  else {
    return (
      <div className={formClass}>
        <form className="form-container-in-mobile" onSubmit={handleSubmit}>
          <div className="line-mobile">
            <input className="fullName-input-mobile" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" />
            <div className="form-divider-mobile"><img src={FormDividerMobile}/></div>
            <input className="email-input-mobile" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
          </div>
          <div className="line-mobile">
            <button className="signup-button-mobile" type="submit"><span className="spaced">I am human</span> and I want <span className="spaced">peace</span></button>
          </div>
        </form>
      </div>
    );
  };
}

export default SubmissionForm;


import React, { useState } from 'react';
import './style/App.css';
import GlobeComponent from './components/GlobeComponent';
import SubmissionForm from './components/SubmissionForm';
import Header from './components/Header';
import Speech from './components/Speech';

const App: React.FC = () => {
  const onSubmitPledge = (pledgeData: { firstName: string; email: string; subject: string }) => {
    const [currentComponent, setCurrentComponent] = useState('home');

    const handleNavClick = (componentName: string) => {
      setCurrentComponent(componentName);
    };
    console.log('Pledge submitted:', pledgeData);
  };

  return (
    <div>
      <div className="globe-container">
          <GlobeComponent />
      </div>
      <div className="App">
        <div className="header-container">
          <Header />
        </div>

        <div className="speech-container">
          <Speech />
        </div>
        
        <div className="signup-container">
          <SubmissionForm onSubmitPledge={onSubmitPledge} />
        </div>

        <div className="intro-text">
          Gaze upon our beautiful planet, a tapestry of cultures, ideas, and aspirations. Here at iamhuman, we stand at the forefront of a digital renaissance, a collective pledge by people from every corner of the Earth to reclaim our earth. Our mission transcends borders and connects hearts, fostering an ecosystem where freedom, collaboration, and innovation aren't just ideals, but the very pillars of our existence. As you witness the globe alight with the souls who have joined this movement, remember that each light represents a voice, a hope, a commitment to a future where we, as a global family, shape a realm as diverse and beautiful as the Earth itself. Together, we are not just users of a network; we are the architects of our destiny. Join us, and be part of this extraordinary journey towards a world where every human being can proudly say: “I Am Free”
        </div>
      </div>
  </div>
  );
}

export default App;

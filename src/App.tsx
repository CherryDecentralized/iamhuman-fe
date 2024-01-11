
import './style/App.css';
import Header from './components/Header';
import Home from './components/Home';
import Ecosystem from './components/Ecosystem';
import Mission from './components/Mission';
import GlobeComponent from './components/GlobeComponent';
import { useEffect, useState } from 'react';

interface SSEData {
    name: string;
    email: string;
    location: {
      countryCodeISO: string;
      countryName: string;
    };
}

const App: React.FC = () => {
  const [currentComponent, setCurrentComponent] = useState('home');
  const [sseData, setSseData] = useState<SSEData>(); // State to store SSE data
  const handleNavClick = (componentName: string) => {
    setCurrentComponent(componentName);
  };

  const createRandomElement = (name, country) => {
    const element = document.createElement('div');
    element.className = 'random-element';
    element.textContent = `${name} - ${country}`;
    const styles = {
      position: 'absolute',
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      fontSize: `${Math.random() * 2 + 0.5}rem`, 
      color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`,
      fontWeight: Math.random() > 0.5 ? 'bold' : 'normal',
      opacity: 1,
      transition: 'opacity 1s ease-out',
    };
    Object.assign(element.style, styles);
    document.body.appendChild(element);
    setTimeout(() => {
      element.style.opacity = '0';
      setTimeout(() => element.remove(), 1000);
    }, 5000);
  };

  useEffect(() => {
    const eventSource = new EventSource(process.env.REACT_APP_FEED_SERVICE_URL);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSseData(currentData => [...currentData, data]);
      createRandomElement(data.name, data.country);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const renderComponent = () => {
    switch (currentComponent) {
      case 'statistics':
        return <Home/>
      case 'home':
        return <Home/>
      case 'ecosystem':
        return <Ecosystem />
      case 'our-mission':
        return <Mission />
      default:
        return <Home/>;
    }
  };

  const globeClassMap = {
    home: 'globe-position-home',
    ecosystem: 'globe-position-ecosystem',
    'our-mission': 'globe-position-our-mission',
    statistics: 'globe-position-statistics'
  };

  const contentContainerClassMap = {
    home: 'content-position-home',
    ecosystem: 'content-position-ecosystem',
    'our-mission': 'content-position-our-mission',
    statistics: 'content-position-statistics'
  };

  const headerContainerClassMap = {
    home: '',
    ecosystem: '-ecosystem',
    'our-mission': '',
    statistics: ''
  };
  
  const headerContainerClass = headerContainerClassMap[currentComponent] || '';  
  const contentContainerClass = contentContainerClassMap[currentComponent] || '';
  const globeClass = globeClassMap[currentComponent] || '';

  return (
    <div className="App">
      <div className={`globe-container ${globeClass}`}>
        <GlobeComponent sseData={sseData} />
      </div>
      <div className={`header-container${headerContainerClass}`}>
        <Header onNavClick={handleNavClick} />
      </div>
      <div className={`content-container ${contentContainerClass}`}>
        {renderComponent()}
      </div>
    </div>
  );
}
export default App;
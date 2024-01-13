
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
  const [sseData, setSseData] = useState<SSEData | undefined>(); // Keep as a single object

  const handleNavClick = (componentName: string) => {
    setCurrentComponent(componentName);
  };

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
  const globeClass = globeClassMap[currentComponent] || '';


  const contentContainerClassMap = {
    home: 'content-position-home',
    ecosystem: 'content-position-ecosystem',
    'our-mission': 'content-position-our-mission',
    statistics: 'content-position-statistics'
  };
  const contentContainerClass = contentContainerClassMap[currentComponent] || '';

  const headerContainerClassMap = {
    home: '',
    ecosystem: '-ecosystem',
    'our-mission': '',
    statistics: ''
  };
  const headerContainerClass = headerContainerClassMap[currentComponent] || '';  

  useEffect(() => {
    const eventSource = new EventSource(process.env.REACT_APP_FEED_SERVICE_URL);
    eventSource.onmessage = (event) => {
      const data: SSEData = JSON.parse(event.data);
      setSseData(data); // Update with the latest data
    };
    return () => {
      eventSource.close();
    };
  }, []);

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
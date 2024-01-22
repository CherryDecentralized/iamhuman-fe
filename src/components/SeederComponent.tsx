import React from 'react';
import '../style/SeederComponent.css';
import * as t from 'three';


import upRate from "../assets/up.svg";
import downRate from "../assets/down.svg";

  
  const SeederComponent: React.FC<{pledge:t.Object3D}> = ({ pledge }) => {
    if (!pledge.userData || !pledge.userData.seederInformation) {
      // Handle the case where userData or seederInformation is not available
      return null;
    }
        const {
        fullName,
        location: { countryCodeISO },
        seederInformation: {
          uploadRate,
          downloadRate,
          cpuShared,
          ramShared,
          carbonSecured
        }
      } = pledge.userData;
        
    const pledgeColor = pledge.material.color.getStyle(); // Assuming color is a Three.js Color
    
    const containerStyle = {
      backgroundColor: pledgeColor,
      opacity: 1 // Adjust as needed
    };
  
    const innerContainerStyle = {
      backgroundColor: pledgeColor,
      opacity: 1 // Adjust as needed
    };

    const isMobile = window.innerWidth <= 768;
    if(!isMobile){
        return (
            <div className="seeder-component-container" style={containerStyle}>
                <span className="countryISO">{countryCodeISO}</span>
                <div className="inner-container" style={innerContainerStyle}>
                    <div className="full-name">{fullName}</div>
                    <div className="updownrates">
                        <span>  </span><img src={upRate}/>   {uploadRate}<span> Kb/s </span>
                        <span>  </span><img src={downRate}/>   {downloadRate}<span> Kb/s </span>
                    </div>
                    <div className="cpuShared">
                        <span className="resource-header">CPU</span><span>{cpuShared}%</span>
                    </div>
                    <div className="ramShared">
                        <span className="resource-header">RAM</span><span>{ramShared}%</span>
                    </div>
                    <div className="carbonSecured">
                        <span className="resource-header"></span><span>{carbonSecured.toFixed(3)}ton/Carbon</span>
                    </div>
                </div>
            </div>
        );
    }
    else
    {
        return(
            <>
              <div className="seeder-component-container">
                <div className="row">
                  <span className="countryISO">{countryCodeISO}</span>
                  <div className="full-name">{fullName}</div>
                  <div className="updownrates">
                        <span>  </span><img src={upRate}/>   {uploadRate}<span> Kb/s </span>
                        <span>  </span><img src={downRate}/>   {downloadRate}<span> Kb/s </span>
                  </div>
                </div>
                <div className="row">
                    <span className="resource-header">CPU</span><span>{cpuShared}%</span>
                    <div className="ramShared">
                        <span className="resource-header">RAM</span><span>{ramShared}%</span>
                    </div>
                    <div className="carbonSecured">
                        <span className="resource-header"></span><span>{carbonSecured.toFixed(3)}ton/Carbon</span>
                    </div>
                </div>
              </div>
            </>
        );
    }
}

export default SeederComponent;

import React from 'react';
import pt5Bg from '../assets/images/pt5_bg.png';

const AboutClepsydra: React.FC = () => {
  return (
    <div className="flex-grow w-full p-0 m-0 pt-24">
      <div className="w-full h-full flex justify-center items-center p-0 m-0">
        <img 
          src={pt5Bg} 
          alt="Clepsydra Background" 
          className="object-contain"
          loading="eager"
          style={{ 
            width: '96vw', 
            height: 'calc(96vh - 96px - 32px - 80px)', 
            maxWidth: '1200px', 
            maxHeight: '80vh', 
            margin: '2vh 2vw' 
          }}
        />
      </div>
    </div>
  );
};

export default AboutClepsydra; 
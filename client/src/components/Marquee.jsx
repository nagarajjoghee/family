import React, { useState, useEffect } from 'react';
import './Marquee.css';

const Marquee = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date();
      // Convert to EST (UTC-5) or EDT (UTC-4)
      const estOffset = -5; // EST offset
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const estTime = new Date(utc + (estOffset * 3600000));
      const hours = estTime.getHours();

      if (hours >= 5 && hours < 12) {
        setGreeting('Good Morning');
      } else if (hours >= 12 && hours < 17) {
        setGreeting('Good Afternoon');
      } else if (hours >= 17 && hours < 21) {
        setGreeting('Good Evening');
      } else {
        setGreeting('Good Night');
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (!greeting) return null;

  return (
    <div className="marquee-container">
      <div className="marquee-content">
        <span className="marquee-text">{greeting}, KSVN Family! Welcome to our photo gallery.</span>
        <span className="marquee-text">{greeting}, KSVN Family! Welcome to our photo gallery.</span>
        <span className="marquee-text">{greeting}, KSVN Family! Welcome to our photo gallery.</span>
      </div>
    </div>
  );
};

export default Marquee;


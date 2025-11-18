import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="ksvn-header">
      <div className="logo-container">
        <div className="heart-wrapper">
          <svg className="heart-logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path
              className="heart-path"
              d="M50,85 C50,85 20,60 20,40 C20,25 30,20 40,25 C45,15 55,15 60,25 C70,20 80,25 80,40 C80,60 50,85 50,85 Z"
              fill="#ff6b9d"
            />
          </svg>
          <div className="love-particles">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="particle" style={{ '--delay': i * 0.1 + 's' }}>❤️</div>
            ))}
          </div>
        </div>
        <h1 className="ksvn-title">KSVN</h1>
      </div>
    </header>
  );
};

export default Header;


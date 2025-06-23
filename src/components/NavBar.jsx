import React from 'react';

export default function NavBar({ selected, onSelect }) {
  return (
    <nav className="navbar">
      <div className={`nav-item left  ${selected==='language' ? 'active' : ''}`} onClick={() => onSelect('language')}>
        Македонски Јазик
      </div>
      <div className={`nav-item center ${selected==='home'     ? 'active' : ''}`} onClick={() => onSelect('home')}>
        Почетна
      </div>
      <div className={`nav-item right ${selected==='abbr'     ? 'active' : ''}`} onClick={() => onSelect('abbr')}>
        Скратеници
      </div>
    </nav>
  );
}
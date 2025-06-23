import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <p>© {year} Никола Сарафимов</p>
      <div className="footer-links">
        <a href="https://nikolasarafimov.github.io/personal-website/" target="_blank" rel="noopener noreferrer">
          Web Page
        </a>
        <a href="https://www.linkedin.com/in/nikola-sarafimov-418753357/" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href="https://github.com/nikolasarafimov" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href="https://www.facebook.com/profile.php?id=100004981455126" target="_blank" rel="noopener noreferrer">
          Facebook
        </a>
      </div>
    </footer>
  );
}
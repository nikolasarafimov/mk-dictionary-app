import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

export default function NavBar({ selected, onSelect }) {
  const [open, setOpen] = useState(false);

  const links = [
    { key: "home", label: "Почетна", path: "/home" },
    { key: "language", label: "Македонски јазик", path: "/language" },
    { key: "abbr", label: "Скратеници", path: "/abbr" },
  ];

  const handleSelect = (key) => {
    onSelect(key);
    setOpen(false);
  };

  return (
    <nav className="pro-nav">
      <div className="pro-nav-inner">
        <Link to="/home" className="pro-nav-logo">
          <span>Македонски Речник на зборови</span>
        </Link>

        <div className="pro-nav-links">
          {links.map((l) => (
            <Link
              key={l.key}
              to={l.path}
              onClick={() => handleSelect(l.key)}
              className={`pro-nav-link ${
                selected === l.key ? "active" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <button
          className="pro-nav-mobile-button"
          onClick={() => setOpen(!open)}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {open && (
        <div className="pro-nav-mobile-menu">
          {links.map((l) => (
            <Link
              key={l.key}
              to={l.path}
              onClick={() => handleSelect(l.key)}
              className="pro-nav-mobile-item"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
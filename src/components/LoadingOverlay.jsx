import React from "react";
import ReactDOM from "react-dom";

export default function LoadingOverlay() {
  return ReactDOM.createPortal(
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="spinner"></div>
        <p>Вчитување на речникот…</p>
        <span className="loading-sub">Ве молиме почекајте.</span>
      </div>
    </div>,
    document.body
  );
}
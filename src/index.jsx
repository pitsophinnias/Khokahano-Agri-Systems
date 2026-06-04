import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /*
   * IMPORTANT: overflow-x must NOT be set on <html>.
   * Setting overflow-x: hidden on <html> breaks position: sticky on all
   * descendants. Keep it only on <body>, which does not break sticky.
   */
  html {
    scroll-behavior: smooth;
  }

  body {
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
    max-width: 100vw;
  }

  img {
    max-width: 100%;
    display: block;
  }

  button, a {
    -webkit-tap-highlight-color: transparent;
  }

  /* Prevent iOS from zooming on input focus */
  input, select, textarea {
    font-size: 16px;
  }

  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { scrollbar-width: none; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
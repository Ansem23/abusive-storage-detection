import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom"; // Import Router
import App from "./App";
import "./index.css";
import { AppProvider } from "./context/AppContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router> {/* Move Router here */}
      <AppProvider>
        <App />
      </AppProvider>
    </Router>
  </React.StrictMode>
);

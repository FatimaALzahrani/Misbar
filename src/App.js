import React from "react";
import { Routes, Route } from "react-router-dom";
import MisbarNDVIMonitor from "./components/SatelliteMonitor";
import MisbarChatbot from "./components/MisbarChatbot";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MisbarNDVIMonitor />} />
      <Route path="/chatbot" element={<MisbarChatbot />} />
    </Routes>
  );
}

export default App;

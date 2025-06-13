// src/App.jsx
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import Routes from "./Routes";
import EnhancedFloatingChatbot from "./components/EnhancedFloatingChatbot";

function App() {
  return (
    <AuthProvider>
      <Routes />
      <EnhancedFloatingChatbot />
    </AuthProvider>
  );
}

export default App;
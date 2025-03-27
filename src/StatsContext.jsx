import React, { createContext, useContext, useState } from "react";

// Create the context
const StatsContext = createContext();

// Create a provider component
export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [name , setName] = useState(null);

  return (
    <StatsContext.Provider value={{ stats, setStats ,name, setName }}>
      {children}
    </StatsContext.Provider>
  );
};

// Custom hook to use the context
export const useStats = () => useContext(StatsContext);
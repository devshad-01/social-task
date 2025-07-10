import React, { createContext, useState, useEffect, useContext } from 'react';

// Define initial state
const initialState = {
  screenSize: 'mobile',
  dimensions: {
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  },
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  isMobileOrTablet: true
};

// Create the context
export const ResponsiveContext = createContext(initialState);

// Create the provider component
export const ResponsiveProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(initialState.screenSize);
  const [dimensions, setDimensions] = useState(initialState.dimensions);
  
  // Update dimensions and screen size on resize
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });
      
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Derived state
  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';
  const isDesktop = screenSize === 'desktop';
  const isMobileOrTablet = isMobile || isTablet;

  const value = {
    screenSize,
    dimensions,
    isMobile,
    isTablet, 
    isDesktop,
    isMobileOrTablet
  };

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

// Custom hook for using the responsive context
export const useResponsive = () => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
};

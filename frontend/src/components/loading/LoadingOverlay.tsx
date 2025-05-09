// Enhanced LoadingOverlay.tsx
import React, { useState, useEffect } from 'react';

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
  const [dots, setDots] = useState('');
  const [progressText, setProgressText] = useState('Initializing');
  
  // Animate the dots
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '');
    }, 400);
    
    return () => clearInterval(dotInterval);
  }, []);
  
  // Cycle through progress messages
  useEffect(() => {
    const messages = [
      'Checking your credentials',
      'Loading your profile',
      'Preparing dashboard', 
      'Almost there'
    ];
    
    let index = 0;
    const msgInterval = setInterval(() => {
      setProgressText(messages[index]);
      index = (index + 1) % messages.length;
    }, 2000);
    
    return () => clearInterval(msgInterval);
  }, []);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <div className="bg-[#1a1f2b] rounded-xl p-8 shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-center text-lg font-medium">{message}</p>
          <p className="text-blue-400 text-center mt-2">
            {progressText}{dots}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
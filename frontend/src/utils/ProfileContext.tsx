import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';



interface ProfileContextType {
  profileData: any | null;
  setProfileData: (data: any| null) => void;
  userType: 'client' | 'consultant' | 'none';
  setUserType: (type: 'client' | 'consultant' | 'none') => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profileData, setProfileData] = useState<any | null>(null);
  const [userType, setUserType] = useState<'client' | 'consultant' | 'none'>('none');
  const [loading, setLoading] = useState(true);

  // Listen for logout event
  useEffect(() => {
    
  }, []);

  const value = {
    profileData,
    setProfileData,
    userType,
    setUserType,
    loading,
    setLoading,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};


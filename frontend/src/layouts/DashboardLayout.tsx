import  { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import TopNav from '../components/Dashboard/Topnav';
import ConsultantProfileCompletionWrapper from '../components/Dashboard/ConsultantProfileCompletionWrapper';
import ClientProfileCompletionWrapper from '../components/Dashboard/ClientProfileCompletionWrapper';
import { useAuth } from '../utils/AuthContext';
import { useProfile } from '../utils/ProfileContext';
import api from '../service/apiService';

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const { user } = useAuth();
    const { 
      setUserType, 
      setProfileData, 
      setLoading, 
      loading,
      profileData
    } = useProfile();

  useEffect(()=>{
    const checkUserProfiles = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Check user role first
        if (user.role === 'CLIENT') {
          try {
            const clientResponse = await api.get(`/api/clients/user/${user.id}`);
            if (clientResponse?.data?.data) {
              setUserType('client');
              setProfileData(clientResponse.data.data);
            }
          } catch (error) {
            console.error('Error fetching client profile:', error);
            setUserType('none');
          }
        } else if (user.role === 'CONSULTANT') {
          try {
            const consultantResponse = await api.get(`/api/consultants/user/${user.id}`);
            if (consultantResponse?.data?.data) {
              setUserType('consultant');
              setProfileData(consultantResponse.data.data);
            }
          } catch (error) {
            console.error('Error fetching consultant profile:', error);
            setUserType('none');
          }
        } else {
          setUserType('none');
        }
      } catch (error) {
        console.error('Error checking user profiles:', error);
        setUserType('none');
      } finally {
        setLoading(false);
      }
    };
    
    checkUserProfiles();
  },[user, setUserType, setProfileData, setLoading])

  

  const whenShouldOutletBeRendered = () => {
    switch(user.role){
      case "CLIENT":
        return profileData.onboardingStatus === "COMPLETED" ? <OutletToRender /> : <ClientProfileCompletionWrapper />
      case "CONSULTANT":
        return profileData.onboardingStatus === "APPROVED" ? <OutletToRender /> : <ConsultantProfileCompletionWrapper />
      case "ADMIN":
        return <OutletToRender />
    }
  }


  const OutletToRender = () => {
    return(
      <div className="min-h-screen bg-[#0f1117]">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        <div className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <TopNav onMenuClick={toggleSidebar} />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
    </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f1117]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return whenShouldOutletBeRendered();
};

export default DashboardLayout; 
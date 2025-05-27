import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../service/apiService';
import { FormViewMode, ScopingForm } from './types';
import FormTable from './components/FormTable';
import FormBuilder from './components/FormBuilder';
import FormView from './components/FormView';



//endpoint to get SERVICE_OPTIONS


  const ScopingForms: React.FC = () => {
  const [viewMode, setViewMode] = useState<FormViewMode>('Table');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedForm, setSelectedForm] = useState<ScopingForm | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [services,setServices]=useState<any>([]);

 
 useEffect(() => {
  const fetchServices = async () => {
    try {
      const response = await api.get('/api/services');
      if (response.data.success) {
        // Transform the fetched service objects into an array of service names:
        const servicesList = response.data.data.map((service: any) => service);
        setServices(servicesList);
      } else {
        toast.error('Failed to fetch services');
      }
    } catch (error) {
      toast.error('Error fetching services');
      console.error(error);
    }
  };
  fetchServices();
}, []);

 
  

  const handleViewForm = (service: any) => {
      console.log('am i comign here? 1',service)
      setSelectedService(service.name);
      setSelectedForm(service.scopingForm);
      setViewMode('View');
      console.log('am i comign here? 2')

   
  };

  const handleAddForm = (service: any) => {
    setSelectedService(service.name);
    setSelectedForm(service);
    setViewMode('Add');
  };

  const handleBackToTable = () => {
    setViewMode('Table');
    setSelectedService('');
    setSelectedForm(null);
    // Refresh the forms list when returning to the table
  };

  const handleSwitchToEdit = () => {
    setViewMode('Edit');
  };

  const handleSwitchToView = () => {
    setViewMode('View');
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'Table':
        return (
          <FormTable 
            serviceOptions={services}
            onViewForm={handleViewForm}
            onAddForm={handleAddForm}
          />
        );
      
      case 'Add':
        return (
          <FormBuilder 
            selectedService={selectedService}
            selectedForm={selectedForm as ScopingForm}
            onBack={handleBackToTable}
          />
        );
      
      case 'View':
        return  (
          <FormView 
            selectedService={selectedService}
            selectedForm={selectedForm as ScopingForm}
            onBack={handleBackToTable}
            onEdit={handleSwitchToEdit}
          />
        )
      
      case 'Edit':
        return selectedForm ? (
          <FormBuilder 
            selectedService={selectedService}
            selectedForm={selectedForm}
            onBack={handleBackToTable}
            onPreview={handleSwitchToView}
            isEdit
          />
        ) : null;
      
      default:
        return null;
    }
  };

  if (loading && viewMode === 'Table') {
    return (
      <div className="h-full flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#131823] p-6 rounded-xl shadow-lg min-h-[500px]">
      {renderContent()}
    </div>
  );
};

export default ScopingForms;
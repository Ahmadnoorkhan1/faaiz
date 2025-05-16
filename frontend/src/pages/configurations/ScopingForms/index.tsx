import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../service/apiService';
import { FormViewMode, ScopingForm } from './types';
import FormTable from './components/FormTable';
import FormBuilder from './components/FormBuilder';
import FormView from './components/FormView';

const SERVICE_OPTIONS = [
  'ISO_27001_INFORMATION_SECURITY_MANAGEMENT_SYSTEM',
  'ISO_27701_PRIVACY_INFORMATION_MANAGEMENT_SYSTEM',
  'ISO_22301_BUSINESS_CONTINUITY_MANAGEMENT_SYSTEM',
  'ISO_27017_CLOUD_SECURITY_CONTROLS',
  'ISO_27018_PII_PROTECTION_IN_PUBLIC_CLOUD',
  'ISO_20000_SERVICE_MANAGEMENT',
  'ISO_12207_SOFTWARE_LIFE_CYCLE',
  'ISO_42001_AI_MANAGEMENT_SYSTEM',
  'TESTING_SERVICES',
  'RISK_ASSESSMENT',
  'BUSINESS_IMPACT_ANALYSIS',
  'PRIVACY_IMPACT_ANALYSIS',
  'DATA_ASSURANCE',
  'AUDIT',
  'AWARENESS_TRAINING',
  'TABLETOP_EXERCISE',
  'OTHER',
];

const ScopingForms: React.FC = () => {
  const [viewMode, setViewMode] = useState<FormViewMode>('Table');
  const [scopingForms, setScopingForms] = useState<ScopingForm[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedForm, setSelectedForm] = useState<ScopingForm | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchAllScopingForms();
  }, []);

  const fetchAllScopingForms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/scoping-forms/get-all');
      setScopingForms(response.data);
    } catch (error) {
      toast.error('Error fetching scoping forms');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewForm = (service: string) => {
    const form = scopingForms.find(form => form.service === service);
    if (form) {
      setSelectedService(service);
      setSelectedForm(form);
      setViewMode('View');
    } else {
      toast.error('Form not found');
    }
  };

  const handleAddForm = (service: string) => {
    setSelectedService(service);
    setSelectedForm(null);
    setViewMode('Add');
  };

  const handleBackToTable = () => {
    setViewMode('Table');
    setSelectedService('');
    setSelectedForm(null);
    // Refresh the forms list when returning to the table
    fetchAllScopingForms();
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
            scopingForms={scopingForms}
            serviceOptions={SERVICE_OPTIONS}
            onViewForm={handleViewForm}
            onAddForm={handleAddForm}
          />
        );
      
      case 'Add':
        return (
          <FormBuilder 
            selectedService={selectedService}
            onBack={handleBackToTable}
          />
        );
      
      case 'View':
        return selectedForm ? (
          <FormView 
            selectedService={selectedService}
            selectedForm={selectedForm}
            onBack={handleBackToTable}
            onEdit={handleSwitchToEdit}
          />
        ) : null;
      
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
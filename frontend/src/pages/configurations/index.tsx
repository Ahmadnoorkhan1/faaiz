import React, { useState, useEffect } from 'react';
import api from '../../service/apiService';
import toast, { Toaster } from 'react-hot-toast';
import FeedbackSystem from './components/FeedbackSystem';
import ConfigurationSystem from './components/ConfigurationSystem';

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

type GroupedConfig = Record<string, ConfigItem[]>;

// Tabs and Feedback system constants
const TABS = ['Configurations', 'Feedback'] as const;
type TabType = (typeof TABS)[number];

const FEEDBACK_CATEGORIES = [
  'Job Fit / Technical Competence',
  'Behavioral & Soft Skills',
  'Cultural Fit',
  'Problem Solving & Critical Thinking',
  'Motivation & Career Goals',
  'Past Performance',
  'Leadership & Initiative',
  'Adaptability',
  'Domain Knowledge',
  'Red Flags'
];




const Configurations: React.FC = () => {
  const [configurations, setConfigurations] = useState<GroupedConfig>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<ConfigItem | null>(null);
  const [newConfig, setNewConfig] = useState<Partial<ConfigItem> | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('Configurations');
  // Feedback state
  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/config');
        
        if (response.data?.success === false) {
          throw new Error(response.data?.message || 'Failed to load configurations');
        }
        
        // If data is empty, initialize with empty object
        const configData = response.data?.data || {};
        setConfigurations(configData);
        
        // Initialize active category from response
        if (!activeCategory && Object.keys(configData).length > 0) {
          setActiveCategory(Object.keys(configData)[0]);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching configurations:', err);
        toast.error(err?.message || 'Failed to load configurations. Please try again later.');
        setLoading(false);
      }
    };
    fetchConfigurations();
  }, []); // Empty dependency array to only run once on component mount

  const handleSaveConfig = async (config: Partial<ConfigItem>) => {
    try {

      const response = await api.post('/api/config', config);
      
      if (response.data?.success === false) {
        throw new Error(response.data?.message || 'Failed to save configuration');
      }
      
      // Refresh configurations
      const configResponse = await api.get('/api/config');
      setConfigurations(configResponse.data.data || {});
      
      // Reset editing states
      setEditingConfig(null);
      setNewConfig(null);
      
      toast.success('Configuration saved successfully');
    } catch (err: any) {
      console.error('Error saving configuration:', err);
      toast.error(err?.message || 'Failed to save configuration. Please try again.');
    }
  };

  const handleDeleteConfig = async (key: string) => {
    if (!window.confirm('Are you sure you want to delete this configuration? This cannot be undone.')) {
      return;
    }
    
    try {
      const response = await api.delete(`/api/config/${key}`);
      
      if (response.data?.success === false) {
        throw new Error(response.data?.message || 'Failed to delete configuration');
      }
      
      // Refresh configurations
      const configResponse = await api.get('/api/config');
      setConfigurations(configResponse.data.data || {});
      
      toast.success('Configuration deleted successfully');
    } catch (err: any) {
      console.error('Error deleting configuration:', err);
      toast.error(err?.message || 'Failed to delete configuration. Please try again.');
    }
  };

  const handleUploadDocument = async (service: string, file: File) => {
    if (!activeCategory) return;
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', activeCategory);
      formData.append('serviceType', service);
      
      // Upload the document using the correct endpoint
      const response = await api.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data?.success === false) {
        throw new Error(response.data?.message || 'Failed to upload document');
      }
      
      // Update the local state with the new document
      setConfigurations(prev => {
        const list = prev[activeCategory] || [];
        const existing = list.find(item => item.key === service);
        
        if (existing) {
          // Update existing document entry
          return {
            ...prev,
            [activeCategory]: list.map(item =>
              item.key === service
                ? { ...item, value: file.name, updatedAt: new Date().toISOString() }
                : item
            )
          };
        } else {
          // Add new entry
          const newEntry: ConfigItem = {
            id: 'cfg' + Date.now(),
            key: service,
            value: file.name,
            category: activeCategory,
            description: 'Document upload',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          return { ...prev, [activeCategory]: [...list, newEntry] };
        }
      });
      
      // Refresh configurations to ensure we have the latest data
      const configResponse = await api.get('/api/config');
      setConfigurations(configResponse.data.data || {});
      
      toast.success('Document uploaded successfully');
    } catch (err: any) {
      console.error('Error uploading document:', err);
      toast.error(err?.message || 'Failed to upload document. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingConfig(null);
    setNewConfig(null);
  };

  const renderConfigForm = (config: Partial<ConfigItem>, isNew = false) => {
    return (
      <div className="bg-[#242935] rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-200">
          {isNew ? 'Add New Configuration' : `Edit: ${config.key}`}
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Key</label>
          <input
            type="text"
            value={config.key || ''}
            onChange={(e) => isNew 
              ? setNewConfig({...newConfig!, key: e.target.value})
              : setEditingConfig({...editingConfig!, key: e.target.value})
            }
            readOnly={!isNew} // Can't change key for existing configs
            className="w-full bg-[#1a1f2b] text-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Value</label>
          <input
            type="text"
            value={config.value || ''}
            onChange={(e) => isNew
              ? setNewConfig({...newConfig!, value: e.target.value})
              : setEditingConfig({...editingConfig!, value: e.target.value})
            }
            className="w-full bg-[#1a1f2b] text-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
          <input
            type="text"
            value={config.category || ''}
            onChange={(e) => isNew
              ? setNewConfig({...newConfig!, category: e.target.value})
              : setEditingConfig({...editingConfig!, category: e.target.value})
            }
            className="w-full bg-[#1a1f2b] text-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
          <textarea
            value={config.description || ''}
            onChange={(e) => isNew
              ? setNewConfig({...newConfig!, description: e.target.value})
              : setEditingConfig({...editingConfig!, description: e.target.value})
            }
            className="w-full bg-[#1a1f2b] text-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
          />
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => isNew 
              ? handleSaveConfig(newConfig!) 
              : handleSaveConfig(editingConfig!)
            }
            disabled={isNew 
              ? !newConfig?.key || !newConfig?.value || !newConfig?.category 
              : !editingConfig?.key || !editingConfig?.value || !editingConfig?.category
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#1E3A8A',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#B91C1C',
              color: 'white',
            },
          },
          duration: 3000,
        }}
      />
      
      {/* Page Tabs */}
      <div className="border-b border-gray-600 mb-6">
        <nav className="-mb-px flex space-x-6">
          {TABS?.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-3 text-sm font-medium ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      
      {activeTab === 'Configurations' && (
       <ConfigurationSystem
        configurations={configurations}
        activeCategory={activeCategory || ''}
        setActiveCategory={setActiveCategory}
        newConfig={newConfig}
        setNewConfig={setNewConfig}
        renderConfigForm={renderConfigForm}
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        handleDeleteConfig={handleDeleteConfig}
        handleUploadDocument={handleUploadDocument}
        loading={loading}
       />
      )}

      {activeTab === 'Feedback' && (
       <FeedbackSystem/>
      )}
    </div>
  );
};

export default Configurations;
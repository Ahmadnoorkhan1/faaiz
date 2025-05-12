import React, { useState, useEffect } from 'react';
import api from '../../service/apiService';
import ProjectProposalUpload from './components/ProjectProposalUpload';
import ProjectPlanUpload from './components/ProjectPlanUpload';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';

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

// Criteria grouped by category
const CRITERIA_BY_CATEGORY: Record<string, string[]> = {
  'Job Fit / Technical Competence': [
    'Relevant experience',
    'Technical skills or certifications',
    'Problem-solving ability',
    'Knowledge of tools/technologies',
    'Ability to learn quickly'
  ],
  'Behavioral & Soft Skills': [
    'Communication skills',
    'Teamwork and collaboration',
    'Conflict resolution',
    'Work ethic and integrity',
    'Time management and organization',
    'Emotional intelligence (EQ)'
  ],
  'Cultural Fit': [
    'Alignment with company values',
    'Attitude and mindset',
    'Professionalism and demeanor',
    'Work style compatibility'
  ],
  'Problem Solving & Critical Thinking': [
    'Analytical thinking',
    'Decision-making under pressure',
    'Creative approaches to challenges'
  ],
  'Motivation & Career Goals': [
    'Why they want the job',
    'Career aspiration alignment',
    'Long-term potential'
  ],
  'Past Performance': [
    'Achievements in past roles',
    'Promotion or growth history',
    'References and endorsements',
    'Employment gap analysis'
  ],
  'Leadership & Initiative': [
    'Leadership style',
    'Examples of initiative',
    'Project/people management experience',
    'Stakeholder management'
  ],
  'Adaptability': [
    'Experience in dynamic environments',
    'Handling change/uncertainty',
    'Response to changing scenarios'
  ],
  'Domain Knowledge': [
    'Industry-specific knowledge',
    'Regulatory awareness'
  ],
  'Red Flags': [
    'Evasive or vague answers',
    'Blaming others for failures',
    'Overstated achievements',
    'Poor listening or attitude'
  ]
};

interface Consultant {
  id: string;
  name: string;
}
const DUMMY_CONSULTANTS: Consultant[] = [
  { id: 'c1', name: 'Alice Johnson' },
  { id: 'c2', name: 'Bob Smith' }
];

// Service types from schema.prisma
const SERVICE_TYPES = [
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
  'OTHER'
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
  const [selectedConsultant, setSelectedConsultant] = useState<string>('');
  const [selectedCategoryFB, setSelectedCategoryFB] = useState<string>(FEEDBACK_CATEGORIES[0]);
  const [feedbackData, setFeedbackData] = useState<Record<string, {score:number; comment:string}>>({});
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
        <> 
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Configuration Settings</h1>
              <p className="text-gray-400 mt-1">
                Manage system configurations and templates
              </p>
            </div>
            
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Configuration category tabs */}
              <div className="bg-[#242935] rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-white">
                    Configuration Categories
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.keys(configurations).map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        activeCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#1a1f2b] text-gray-300 hover:bg-[#323a50]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rest of configurations tab content */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-200">Platform Configurations</h1>
                  <p className="text-gray-400 mt-1">Manage system-wide settings and configurations</p>
                </div>
                <button 
                  onClick={() => setNewConfig({ key: '', value: '', category: activeCategory || '' })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add New Configuration
                </button>
              </div>

              {/* Configuration Content */}
              <div className="md:col-span-3 bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
                {newConfig ? (
                  renderConfigForm(newConfig, true)
                ) : editingConfig ? (
                  renderConfigForm(editingConfig)
                ) : activeCategory === 'Project Proposal' ? (
                  <ProjectProposalUpload
                    category={activeCategory}
                    configurations={configurations[activeCategory] || []}
                    onUpload={handleUploadDocument}
                  />
                ) : activeCategory === 'Project Plan' ? (
                  <ProjectPlanUpload
                    configurations={configurations[activeCategory] || []}
                    // category=''
                    // projectId=''
                  />
                ) : activeCategory && configurations[activeCategory] ? (
                  <>
                    <h2 className="text-lg font-medium text-gray-200 mb-4">
                      {activeCategory} Settings
                    </h2>
                    <div className="space-y-4">
                      {configurations[activeCategory].map(config => (
                        <div key={config.id} className="bg-[#242935] rounded-xl p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-gray-200 font-medium">{config.key}</h3>
                                <p className="text-gray-400 text-sm mt-1">{config.description}</p>
  
                            
                            </div>
                            
                            <div className="flex space-x-2">
                            <button 
  onClick={() => setEditingConfig(config)}
  className="flex items-center gap-1 text-sm px-2 py-1 rounded shadow-sm text-white hover:text-blue-400 border border-blue-200 hover:border-blue-300 transition"
>
  
  Edit
</button>

<button 
  onClick={() => handleDeleteConfig(config.key)}
  className="flex items-center gap-1 text-sm px-2 py-1 rounded shadow-sm text-white hover:text-red-400 border border-red-200 hover:border-red-300 transition"
>
 
  Delete
</button>

                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-[#1a1f2b] rounded-lg text-gray-300">
                            {config.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p>Select a category or add a new configuration</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'Feedback' && (
        <div className="space-y-6">
          {/* Consultant Selection */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-200">Feedback System</h2>
            <select
              value={selectedConsultant}
              onChange={(e) => setSelectedConsultant(e.target.value)}
              className="bg-[#1a1f2b] text-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Select Consultant</option>
              {DUMMY_CONSULTANTS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Category Selection */}
          <div className="bg-[#242935] rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-medium text-gray-200 mb-4">Assessment Category</h3>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFB(cat)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategoryFB === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#1a1f2b] text-gray-400 hover:bg-[#2e3446]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Criteria Table */}
          <div className="bg-[#242935] rounded-xl p-6 shadow-lg overflow-x-auto">
            <table className="min-w-full text-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Evaluation Criteria</th>
                  <th className="px-4 py-2 text-left">Score (1-5)</th>
                  <th className="px-4 py-2 text-left">Comments</th>
                </tr>
              </thead>
              <tbody>
                {(CRITERIA_BY_CATEGORY[selectedCategoryFB] || []).map(criteria => (
                  <tr key={criteria} className="border-t border-gray-600">
                    <td className="px-4 py-2">{criteria}</td>
                    <td className="px-4 py-2">
                      <select
                        value={feedbackData[criteria]?.score || ''}
                        onChange={(e) =>
                          setFeedbackData({
                            ...feedbackData,
                            [criteria]: {
                              ...feedbackData[criteria],
                              score: Number(e.target.value)
                            }
                          })
                        }
                        className="bg-[#1a1f2b] text-gray-200 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-</option>
                        {[1,2,3,4,5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <textarea
                        value={feedbackData[criteria]?.comment || ''}
                        onChange={(e) =>
                          setFeedbackData({
                            ...feedbackData,
                            [criteria]: {
                              ...feedbackData[criteria],
                              comment: e.target.value
                            }
                          })
                        }
                        className="w-full bg-[#1a1f2b] text-gray-200 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={() => alert('Feedback saved')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configurations;
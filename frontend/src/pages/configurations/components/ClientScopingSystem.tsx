import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../service/apiService';
import { FaEye, FaEdit, FaChevronDown, FaChevronUp, FaFilePdf } from 'react-icons/fa';

// Types
interface Client {
  id: string;
  userId: string;
  fullName: string;
  organization: string;
  requestedServices: string[];
  user: {
    id: string;
    email: string;
  };
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'radio' | 'checkbox';
  required: boolean;
  options?: string[];
}

interface ScopingForm {
  id: string;
  service: string;
  questions: Question[];
  createdById: string;
  clientId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ScopingFormSubmission {
  id: string;
  clientId: string;
  serviceType: string;
  responses: Record<string, any>;
  submittedBy: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[]; // The questions at the time of submission
}

const ClientScopingSystem: React.FC = () => {
  // State for clients and selected client
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingClients, setLoadingClients] = useState(false);
  
  // State for scoping forms
  const [scopingForms, setScopingForms] = useState<Record<string, ScopingForm>>({});
  const [loadingForms, setLoadingForms] = useState(false);
  
  // State for responses
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [activeService, setActiveService] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  // State for submissions history
  const [submissions, setSubmissions] = useState<ScopingFormSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<ScopingFormSubmission | null>(null);
  const [viewMode, setViewMode] = useState<'fill' | 'view'>('fill');
  const [expandedSubmissions, setExpandedSubmissions] = useState<Record<string, boolean>>({});

  // Fetch all clients when component mounts
  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch client's scoping forms and submissions when client is selected
  useEffect(() => {
    if (selectedClient) {
      fetchClientScopingForms();
    //   fetchClientSubmissions();
    } else {
      setScopingForms({});
      setFormResponses({});
      setActiveService(null);
      setSubmissions([]);
      setActiveSubmission(null);
    }
  }, [selectedClient]);

  // Fetch all clients
  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await api.get('/api/clients');
      
      if (response.data?.success) {
        const processedClients = response.data.data.map((client: any) => {
          // Parse requestedServices if it's a string
          let requestedServices = client.requestedServices || [];
          if (typeof requestedServices === 'string') {
            try {
              requestedServices = requestedServices
                .replace(/[{}]/g, '')
                .split(',');
            } catch (e) {
              requestedServices = [];
            }
          }
          
          return {
            ...client,
            requestedServices,
            user: client.user || { id: client.userId, email: 'N/A' }
          };
        });
        
        setClients(processedClients);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch clients');
      }
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast.error(error.message || 'Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
  };

  // Fetch client submissions
//   const fetchClientSubmissions = async () => {
//     if (!selectedClient) return;
    
//     try {
//       setLoadingSubmissions(true);
      
//       // Use our new API endpoint
//       const response = await api.get(`/api/scoping-forms/client/${selectedClient.id}/service`);
      
//       if (response.data?.success) {
//         // Process the submissions to match our component's expected format
//         const processedSubmissions = Array.isArray(response.data.data) 
//           ? response.data.data.map((sub: any) => ({
//               id: sub.id,
//               clientId: sub.clientId,
//               serviceType: sub.service,
//               responses: typeof sub.answers === 'string' ? JSON.parse(sub.answers) : sub.answers,
//               submittedBy: sub.createdById,
//               status: sub.status,
//               notes: sub.notes,
//               createdAt: sub.createdAt,
//               updatedAt: sub.updatedAt,
//               questions: typeof sub.questions === 'string' ? JSON.parse(sub.questions) : sub.questions
//             }))
//           : [];
          
//         setSubmissions(processedSubmissions);
        
//         // If there are submissions, set view mode by default
//         if (processedSubmissions.length > 0) {
//           setViewMode('view');
//           setActiveSubmission(processedSubmissions[0]);
//         } else {
//           setViewMode('fill');
//           setActiveSubmission(null);
//         }
//       } else {
//         throw new Error(response.data?.message || 'Failed to fetch submissions');
//       }
//     } catch (error: any) {
//       console.error('Error fetching submissions:', error);
//       toast.error(error.message || 'Failed to load submission history');
//     } finally {
//       setLoadingSubmissions(false);
//     }
//   };

  // Fetch scoping forms for the selected client
  const fetchClientScopingForms = async () => {
  if (!selectedClient) return;

  try {
    setLoadingForms(true);
    setFormResponses({});

    const formsByService: Record<string, ScopingForm> = {};

    // Get scoping forms for each of the client's requested services
    for (const service of selectedClient.requestedServices) {
      try {
        const response = await api.post('/api/scoping-forms/get-by-service', {
          service,
        });

        // Handle the correct response structure for the provided API response
        if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
          // The API returns an array of form templates for the service
          const form = response.data.data[0];
          // Ensure questions are always an array of objects
          if (Array.isArray(form.questions)) {
            formsByService[service] = {
              ...form,
              questions: form.questions.map((q: any) => ({
                id: q.id,
                text: q.text,
                type: q.type,
                required: q.required ?? false,
                options: q.options ?? [],
              })),
            };
          }
        }
      } catch (err) {
        console.warn(`No scoping form found for service: ${service}`);
      }
    }

    setScopingForms(formsByService);

    // Set active service to the first one that has a form
    const serviceWithForm = Object.keys(formsByService)[0];
    setActiveService(serviceWithForm || null);

    // Initialize form responses
    const initialResponses: Record<string, any> = {};
    Object.entries(formsByService).forEach(([service, form]) => {
      if (Array.isArray(form.questions)) {
        form.questions.forEach((question) => {
          initialResponses[question.id] = question.type === 'checkbox' ? [] : '';
        });
      }
    });

    setFormResponses(initialResponses);
  } catch (error: any) {
    console.error('Error fetching scoping forms:', error);
    toast.error(error.message || 'Failed to load scoping forms');
  } finally {
    setLoadingForms(false);
  }
};

  // Handle client selection
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    if (!clientId) {
      setSelectedClient(null);
      return;
    }
    
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
  };

  // Handle form response changes
  const handleResponseChange = (questionId: string, value: any) => {
    setFormResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Handle checkbox responses
  const handleCheckboxChange = (questionId: string, optionValue: string, checked: boolean) => {
    setFormResponses(prev => {
      const currentSelections = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentSelections, optionValue]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentSelections.filter((val: string) => val !== optionValue)
        };
      }
    });
  };

  // Toggle submission expansion
  const toggleSubmissionExpansion = (submissionId: string) => {
    setExpandedSubmissions(prev => ({
      ...prev,
      [submissionId]: !prev[submissionId]
    }));
  };

  // Handle form submission - Updated to use our new API
  const handleSubmitForm = async () => {
    if (!selectedClient || !activeService) return;
    
    try {
      setSubmitting(true);
      
      // Get the current form
      const currentForm = scopingForms[activeService];
      
      if (!currentForm || !currentForm.questions) {
        toast.error('Cannot submit form: form data is incomplete');
        return;
      }
      
      // Parse questions if they're stored as a string
      const questions = typeof currentForm.questions === 'string'
        ? JSON.parse(currentForm.questions)
        : currentForm.questions;
      
      // Validate required fields
      const missingRequired = Object.values(questions)
        .filter((q: any) => q.required)
        .filter((q: any) => {
          const questionId = q.id || '';
          const response = formResponses[questionId];
          return (
            response === undefined || 
            response === '' || 
            (Array.isArray(response) && response.length === 0)
          );
        });
      
      if (missingRequired.length > 0) {
        toast.error(`Please fill out all required fields (${missingRequired.length} missing)`);
        return;
      }
      
      // Prepare payload for our API
      const payload = {
        clientId: selectedClient.id,
        serviceType: activeService,
        responses: formResponses,
        notes,
        status: 'SUBMITTED'
      };
      
      // Submit form using our new API endpoint
      const response = await api.post('/api/scoping-forms/client-submission', payload);
      
      if (response.data?.success) {
        toast.success('Scoping form submitted successfully');
        // Reset form
        setFormResponses({});
        setNotes('');
        // Refresh submissions
        // fetchClientSubmissions();
        // Switch to view mode
        setViewMode('view');
      } else {
        throw new Error(response.data?.message || 'Failed to submit form');
      }
    } catch (error: any) {
      console.error('Error submitting scoping form:', error);
      toast.error(error.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  // Format service name for display
  const formatServiceName = (service: string): string => {
    return service
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render submission history
  const renderSubmissions = () => {
    if (loadingSubmissions) {
      return (
        <div className="text-center text-gray-400 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Loading submission history...</p>
        </div>
      );
    }

    if (submissions.length === 0) {
      return (
        <div className="bg-[#1a1f2b] p-6 rounded-lg text-gray-400 text-center">
          No submissions found for this client.
        </div>
      );
    }

    // Group submissions by service type
    const groupedSubmissions: Record<string, ScopingFormSubmission[]> = {};
    submissions.forEach(submission => {
      if (!groupedSubmissions[submission.serviceType]) {
        groupedSubmissions[submission.serviceType] = [];
      }
      groupedSubmissions[submission.serviceType].push(submission);
    });

    return (
      <div className="space-y-6">
        {Object.entries(groupedSubmissions).map(([service, serviceSubmissions]) => (
          <div key={service} className="bg-[#1a1f2b] p-4 rounded-lg border border-gray-700">
            <h3 className="text-lg font-medium text-blue-400 mb-4">
              {formatServiceName(service)}
            </h3>
            
            <div className="space-y-4">
              {serviceSubmissions.map(submission => (
                <div 
                  key={submission.id} 
                  className="bg-[#242935] rounded-lg border border-gray-600 overflow-hidden"
                >
                  <div 
                    className="flex items-center justify-between px-4 py-3 cursor-pointer bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600"
                    onClick={() => toggleSubmissionExpansion(submission.id)}
                  >
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs mr-3 ${
                        submission.status === 'SUBMITTED' ? 'bg-blue-900/40 text-blue-300' :
                        submission.status === 'APPROVED' ? 'bg-green-900/40 text-green-300' :
                        submission.status === 'REJECTED' ? 'bg-red-900/40 text-red-300' :
                        'bg-yellow-900/40 text-yellow-300'
                      }`}>
                        {submission.status}
                      </span>
                      <span className="text-gray-300">
                        Submitted on {formatDate(submission.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <button 
                        className="p-2 text-gray-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSubmission(submission);
                        }}
                        aria-label="View details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Toggle expansion"
                      >
                        {expandedSubmissions[submission.id] ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>
                  </div>
                  
                  {expandedSubmissions[submission.id] && (
                    <div className="px-4 py-3 border-t border-gray-700">
                      <div className="grid gap-4">
                        {/* Handle different question formats */}
                        {Array.isArray(submission.questions) 
                          ? submission.questions.map(question => (
                              <div key={question.id} className="border-b border-gray-700 pb-3">
                                <p className="text-gray-300 font-medium mb-2">{question.text}</p>
                                <div className="bg-[#1a1f2b] p-3 rounded">
                                  {renderResponseValue(question, submission.responses[question.id])}
                                </div>
                              </div>
                            ))
                          : Object.entries(submission.questions).map(([questionId, questionData]: [string, any]) => (
                              <div key={questionId} className="border-b border-gray-700 pb-3">
                                <p className="text-gray-300 font-medium mb-2">
                                  {questionData.text || questionData.question || questionData}
                                </p>
                                <div className="bg-[#1a1f2b] p-3 rounded">
                                  {renderResponseValue(
                                    { 
                                      id: questionId, 
                                      text: questionData.text || questionData.question || questionData,
                                      type: questionData.type || 'text',
                                      required: questionData.required || false,
                                      options: questionData.options
                                    }, 
                                    submission.responses[questionId]
                                  )}
                                </div>
                              </div>
                            ))
                        }
                        
                        {submission.notes && (
                          <div className="border-b border-gray-700 pb-3">
                            <p className="text-gray-300 font-medium mb-2">Additional Notes</p>
                            <div className="bg-[#1a1f2b] p-3 rounded text-gray-300">
                              {submission.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render the response value based on question type
  const renderResponseValue = (question: Question, value: any) => {
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
      return <span className="text-gray-500 italic">No response</span>;
    }

    switch (question.type) {
      case 'text':
        return <span className="text-gray-300">{value}</span>;
        
      case 'radio':
        return <span className="text-gray-300">{value}</span>;
        
      case 'checkbox':
        return (
          <div className="space-y-1">
            {Array.isArray(value) && value.map((item, idx) => (
              <div key={idx} className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        );
        
      default:
        return <span className="text-gray-300">{JSON.stringify(value)}</span>;
    }
  };

  // Render active submission details
  const renderActiveSubmission = () => {
    if (!activeSubmission) {
      return (
        <div className="bg-[#1a1f2b] p-6 rounded-lg text-gray-400 text-center">
          Select a submission to view details
        </div>
      );
    }

    // Handle different question formats
    const submissionQuestions = Array.isArray(activeSubmission.questions)
      ? activeSubmission.questions
      : Object.entries(activeSubmission.questions).map(([id, data]: [string, any]) => ({
          id,
          text: typeof data === 'string' ? data : data.text || data.question || '',
          type: typeof data === 'string' ? 'text' : data.type || 'text',
          required: typeof data === 'string' ? false : data.required || false,
          options: typeof data === 'string' ? [] : data.options || []
        }));

    return (
      <div className="space-y-6">
        <div className="bg-[#1a1f2b] p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-200">
              {formatServiceName(activeSubmission.serviceType)} Form
            </h3>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs ${
                activeSubmission.status === 'SUBMITTED' ? 'bg-blue-900/40 text-blue-300' :
                activeSubmission.status === 'APPROVED' ? 'bg-green-900/40 text-green-300' :
                activeSubmission.status === 'REJECTED' ? 'bg-red-900/40 text-red-300' :
                'bg-yellow-900/40 text-yellow-300'
              }`}>
                {activeSubmission.status}
              </span>
              <button 
                className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs flex items-center"
                onClick={() => {/* TODO: Implement export to PDF */}}
              >
                <FaFilePdf className="mr-1" /> Export PDF
              </button>
            </div>
          </div>
          
          <div className="space-y-1 mb-6">
            <p className="text-gray-400">Submitted on: <span className="text-gray-300">{formatDate(activeSubmission.createdAt)}</span></p>
            <p className="text-gray-400">Submitted by: <span className="text-gray-300">{activeSubmission.submittedBy || 'System'}</span></p>
          </div>
          
          <div className="space-y-6">
            {submissionQuestions.map((question, index) => (
              <div 
                key={question.id} 
                className="bg-[#242935] p-6 rounded-lg border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-white font-medium">
                    <span className="text-blue-400 mr-2">{index + 1}.</span>
                    {question.text}
                    {question.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>
                </div>
                
                <div className="bg-[#1a1f2b] p-4 rounded-lg">
                  {renderResponseValue(question, activeSubmission.responses[question.id])}
                </div>
              </div>
            ))}
            
            {activeSubmission.notes && (
              <div className="bg-[#242935] p-6 rounded-lg border border-gray-700">
                <h3 className="text-white font-medium mb-4">Additional Notes</h3>
                <div className="bg-[#1a1f2b] p-4 rounded-lg">
                  <p className="text-gray-300 whitespace-pre-line">{activeSubmission.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render scoping form questions
  const renderQuestions = () => {
    if (!activeService || !scopingForms[activeService]) {
      return (
        <div className="bg-[#1a1f2b] p-6 rounded-lg text-gray-400 text-center">
          No scoping form available for this service.
        </div>
      );
    }
    
    const form = scopingForms[activeService];
    
    // Parse questions if stored as a string
    const questions = typeof form.questions === 'string'
      ? JSON.parse(form.questions)
      : form.questions;
    
    return (
      <div className="space-y-6">
        {Object.entries(questions).map(([questionId, questionData]: [string, any], index) => {
          // Handle different question data formats
          const question = typeof questionData === 'string' 
            ? { id: questionId, text: questionData, type: 'text', required: false } 
            : { 
                id: questionId, 
                text: questionData.text || questionData.question || '', 
                type: questionData.type || 'text', 
                required: questionData.required || false,
                options: questionData.options || []
              };
          
          return (
            <div 
              key={questionId} 
              className="bg-[#1a1f2b] p-6 rounded-lg border border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-white font-medium">
                  <span className="text-blue-400 mr-2">{index + 1}.</span>
                  {question.text}
                  {question.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h3>
              </div>
              
              {renderQuestionInput(question as any)}
            </div>
          );
        })}
        
        <div className="bg-[#1a1f2b] p-6 rounded-lg border border-gray-700">
          <label className="block text-white font-medium mb-2">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#242935] text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter any additional notes or observations..."
          />
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmitForm}
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Scoping Form'}
          </button>
        </div>
      </div>
    );
  };

  // Render different input types based on question type
  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={formResponses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full bg-[#242935] text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your response..."
          />
        );
        
      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={formResponses[question.id] === option}
                  onChange={() => handleResponseChange(question.id, option)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-[#242935]"
                />
                <span className="text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(formResponses[question.id]) && 
                          formResponses[question.id].includes(option)}
                  onChange={(e) => handleCheckboxChange(question.id, option, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-[#242935] rounded"
                />
                <span className="text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={formResponses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full bg-[#242935] text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your response..."
          />
        );
    }
  };

  // Render service selector tabs
  const renderServiceTabs = () => {
    if (!selectedClient) return null;
    
    const availableServices = selectedClient.requestedServices.filter(
      service => scopingForms[service]
    );
    
    if (availableServices.length === 0) {
      return (
        <div className="text-yellow-500 mb-4">
          No scoping forms available for this client's services.
        </div>
      );
    }
    
    return (
      <div className="mb-6 border-b border-gray-700">
        <div className="flex space-x-4 overflow-x-auto pb-1">
          {availableServices.map(service => (
            <button
              key={service}
              onClick={() => setActiveService(service)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap
                ${activeService === service
                  ? 'bg-[#1a1f2b] text-white border-t border-l border-r border-gray-700'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              {formatServiceName(service)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-200">Client Scoping Forms</h2>
      </div>
      
      {/* Client selection */}
      <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Select Client</h3>
        <div className="mb-4">
          <select
            value={selectedClient?.id || ''}
            onChange={handleClientChange}
            disabled={loadingClients}
            className="w-full bg-[#242935] text-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
          >
            <option value="">-- Select a client --</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.fullName} - {client.organization}
              </option>
            ))}
          </select>
        </div>
        
        {loadingClients && (
          <div className="text-center text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p>Loading clients...</p>
          </div>
        )}
        
        {selectedClient && (
          <div className="bg-[#242935] p-4 rounded-lg">
            <h4 className="font-medium text-gray-300 mb-2">Client Details</h4>
            <p className="text-gray-300">Name: <span className="text-white">{selectedClient.fullName}</span></p>
            <p className="text-gray-300">Organization: <span className="text-white">{selectedClient.organization}</span></p>
            <p className="text-gray-300">Email: <span className="text-white">{selectedClient.user?.email}</span></p>
            <div className="mt-2">
              <p className="text-gray-300">Requested Services:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedClient.requestedServices.map(service => (
                  <span key={service} className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs">
                    {formatServiceName(service)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* View mode toggle */}
      {selectedClient && submissions.length > 0 && (
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setViewMode('fill')}
            className={`py-2 px-4 text-sm font-medium ${
              viewMode === 'fill'
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FaEdit className="inline-block mr-2" />
            Fill New Form
          </button>
          <button
            onClick={() => setViewMode('view')}
            className={`py-2 px-4 text-sm font-medium ${
              viewMode === 'view'
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FaEye className="inline-block mr-2" />
            View Submissions
          </button>
        </div>
      )}
      
      {/* Scoping form or submissions view */}
      {selectedClient && (
        <div className="bg-[#242935] rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-medium text-gray-200 mb-4">
            {viewMode === 'fill' ? 'Fill Scoping Form' : 'Submission History'}
          </h3>
          
          {viewMode === 'fill' ? (
            loadingForms ? (
              <div className="text-center text-gray-400 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p>Loading scoping forms...</p>
              </div>
            ) : (
              <>
                {renderServiceTabs()}
                {renderQuestions()}
              </>
            )
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 overflow-y-auto max-h-[80vh]">
                {renderSubmissions()}
              </div>
              <div className="lg:col-span-2 overflow-y-auto max-h-[80vh]">
                {renderActiveSubmission()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientScopingSystem;
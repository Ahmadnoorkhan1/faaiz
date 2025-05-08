import React, { useState } from 'react';
import api from '../../../service/apiService';
import toast from 'react-hot-toast';

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectPlanUploadProps {
  configurations: ConfigItem[];
  projectId?: string;
}

const ProjectPlanUpload: React.FC<ProjectPlanUploadProps> = ({ configurations, projectId = '' }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadExcelFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('projectId', 'ee891d0c-d228-4b2d-aa6b-f5e67338457c');
    
    try {
      const response = await api.post('/api/tasks/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data?.success) {
        toast.success('Project plan uploaded successfully!');
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('excelFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(response.data?.message || 'Failed to upload project plan');
      }
    } catch (err: any) {
      console.error('Error uploading project plan:', err);
      toast.error(err?.message || 'Failed to upload project plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-200">Project Plan Upload</h2>
      </div>
      
      <p className="text-gray-400">
        Upload an Excel file containing the project plan tasks and timeline.
        The system will automatically import tasks from the spreadsheet.
      </p>
      
      <div className="bg-[#242935] rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Excel File (.xlsx)
          </label>
          <input
            type="file"
            id="excelFile"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700
              file:cursor-pointer
              bg-[#1a1f2b] rounded-lg p-2"
          />
        </div>
        
        {selectedFile && (
          <div className="bg-[#1a1f2b] rounded-lg p-3 text-gray-300">
            Selected: {selectedFile.name}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={uploadExcelFile}
            disabled={!selectedFile || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              'Import Project Plan'
            )}
          </button>
        </div>
      </div>
      
      {configurations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-md font-medium text-gray-200 mb-4">Previous Uploads</h3>
          <div className="space-y-3">
            {configurations.map(config => (
              <div key={config.id} className="bg-[#242935] rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-gray-200 font-medium">{config.key}</h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Uploaded on {new Date(config.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-[#1a1f2b] rounded-lg text-gray-300">
                  {config.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPlanUpload;
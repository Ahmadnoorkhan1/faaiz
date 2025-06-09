import ScopingForms from "../ScopingForms";
import ProjectPlanUpload from "./ProjectPlanUpload";
import ProjectProposalUpload from "./ProjectProposalUpload";
import ServiceManagement from "./Services/ServiceManagement";
import Permissions from "./Permissions";
// import ScopingForm from "./ScopingForm";
// import ScopingFormBuilder from "./ScopingFormBuilder";
// import ScopingForm from "./ScopingForm";

interface ConfigurationSystemProps {
  configurations: any;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  newConfig: any;
  setNewConfig: (config: any) => void;
  renderConfigForm: (config: any, isNew?: boolean) => React.ReactNode;
  editingConfig: any;
  setEditingConfig: (config: any) => void;
  handleDeleteConfig: (key: string) => void;
  handleUploadDocument: (service: string, file: File) => void;
  loading: boolean;
}

const ConfigurationSystem = ({
  configurations,
  activeCategory,
  setActiveCategory,
  newConfig,
  setNewConfig,
  renderConfigForm,
  editingConfig,
  setEditingConfig,
  handleDeleteConfig,
  handleUploadDocument,
  loading,
}: ConfigurationSystemProps) => {
  const ConfigurationsSettings = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Configuration Settings
          </h1>
          <p className="text-gray-400 mt-1">
            Manage system configurations and templates
          </p>
        </div>
      </div>
    );
  };

  const ConfigurationCategories = () => {
    return (
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
                  ? "bg-blue-600 text-white"
                  : "bg-[#1a1f2b] text-gray-300 hover:bg-[#323a50]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const ConfigurationsPlatform = () => {
    return (
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">
            Platform Configurations
          </h1>
          <p className="text-gray-400 mt-1">
            Manage system-wide settings and configurations
          </p>
        </div>
        <button
          onClick={() =>
            setNewConfig({
              key: "",
              value: "",
              category: activeCategory || "",
            })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Configuration
        </button>
      </div>
    );
  };

  const ConfigurationContent = () => {
    if (newConfig) {
      return renderConfigForm(newConfig, true);
    }

    switch (activeCategory) {
      case "Project Proposal":
        return (
          <ProjectProposalUpload
            category={activeCategory}
            configurations={configurations[activeCategory] || []}
            onUpload={handleUploadDocument}
          />
        );
      case "Project Plan":
        return (
          <ProjectPlanUpload
            configurations={configurations[activeCategory] || []}
            // category=''
            // projectId=''
          />
        );
      case "Scoping Form":
        return <ScopingForms />;

      case "Service":
        return <ServiceManagement />; //calll the component here
      case "Permissions":
        return <Permissions />;

      case "":
        return noConfigurations();

      default:
        return defaultConfigurations();
    }
  };

  const defaultConfigurations = () => {
    return (
      <div>
        <div className=" py-2 flex  justify-between">
          <h2 className="text-lg font-medium text-gray-200 mb-4">
            {activeCategory} Settings
          </h2>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => renderConfigForm(editingConfig)}
          >
            Add New Key
          </button>
        </div>
        <div className="space-y-4">
          {configurations[activeCategory].map((config: any) => (
            <div key={config.id} className="bg-[#242935] rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-200 font-medium">{config.key}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {config.description}
                  </p>
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
      </div>
    );
  };

  const noConfigurations = () => {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p>Select a category or add a new configuration</p>
      </div>
    );
  };

  return (
    <>
      {ConfigurationsSettings()}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Configuration category tabs */}
          {ConfigurationCategories()}

          {/* Rest of configurations tab content */}
          {ConfigurationsPlatform()}

          {/* Configuration Content */}
          <div className="md:col-span-3 bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
            {ConfigurationContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default ConfigurationSystem;

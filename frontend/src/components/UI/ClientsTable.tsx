import React, { useEffect, useState } from "react";
import { FiCalendar } from "react-icons/fi";
import { getClientInitials, getStatusText } from "../../utils/TableHelper";
import "../../index.css";
import StatusBadge from "../../pages/configurations/components/ConsultantManagement/StatusBadge";
import { formatServiceName } from "../../pages/configurations/components/ProjectProposalUpload";
interface TableProps {
  columns: string[];
  data: any[];
  header: string[];
  pagination: boolean;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onboardingStatus: string;
  setOnboardingStatus: (status: string) => void;
  fetchClients: () => void;
  handleInviteModel: (data: any) => void;
}

const ClientsTable = ({
  columns,
  data,
  header,
  pagination,
  pageSize,
  pageNumber,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
  searchQuery,
  onSearchChange,
  onboardingStatus,
  setOnboardingStatus,
  fetchClients,
  handleInviteModel,
}: TableProps) => {
  
  useEffect(() => {
    console.log(searchQuery);
  }, [searchQuery]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  const handleViewProfile = (data: any) => {
    setProfileData(data);
    setIsModalOpen(true);
  }

  const introduction = (d: any, column: string) => {
    return (
      <div className="flex items-center">
        <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-medium shadow-md">
          {getClientInitials(d[column])}
        </div>
        <div className="ml-4 max-w-[200px]">
          <div
            className="text-sm font-medium text-gray-200 truncate"
            title={d[column]}
          >
            {d[column]}
          </div>
          <div className="flex flex-col items-start mt-1">
            <div
              className="text-xs text-gray-400 truncate"
              title={d.phoneNumber}
            >
              {d.phoneNumber}
            </div>
            {d.discoveryCallDate && (
              <div className=" flex items-center text-xs text-blue-400">
                <FiCalendar className="mr-1" size={12} />
                <span>
                  {new Date(d.discoveryCallDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const requestedService = (service: string) => {
    return (
      <span
        className="block max-w-xs truncate text-gray-200 cursor-default"
        title={getStatusText(service)}
      >
        {getStatusText(service)}
      </span>
    );
  };

  const renderOnboardingStatus = (status: string) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-600 w-[125px] overflow-wrap text-center`}
      >
        {getStatusText(status)}
      </span>
    );
  };

  const actions = (data: any) => {
    return (
      <div className="flex items-center gap-2">
        <button className="px-4 py-2  text-blue-600 rounded-md cursor-pointer" onClick={() => handleViewProfile(data)}>
          View
        </button>
        {
          (data.onboardingStatus === "NOT_STARTED" || data.onboardingStatus === "DISCOVERY_SCHEDULED") && (
          <button
            onClick={() => handleInviteModel(data)}
            className="px-4 py-2  text-blue-600 rounded-md cursor-pointer"
          >
            Invite
          </button>
          )
        }
      </div>
    );
  };

  const renderColumn = (data: any) => {
    return columns.map((column, key) => {
      switch (column) {
        case "fullName":
          return (
            <td className="px-6 py-4 " key={column + data.id + key}>
              {introduction(data, column)}
            </td>
          );
        case "organization":
          return (
            <td className="px-6 py-4  text-white" key={column + data.id + key}>
              {data.organization}
            </td>
          );
        case "email":
          return (
            <td
              className="px-6 py-4  text-white text-sm truncate"
              key={column + data.id + key}
            >
              <span
                className="block max-w-xs truncate text-gray-200 cursor-default"
                title={data.user.email}
              >
                {data.user.email}
              </span>
            </td>
          );
        case "requestedServices":
          return (
            <td className="px-6 py-4  text-white" key={column + data.id + key}>
              {requestedService(data.requestedServices[0])}
            </td>
          );
        case "onboardingStatus":
          return (
            <td className="px-6 py-4  text-white" key={column + data.id + key}>
              {renderOnboardingStatus(data.onboardingStatus)}
            </td>
          );
        case "Actions":
          return (
            <td className=" py-4  text-white" key={column + data.id + key}>
              {actions(data)}
            </td>
          );
        default:
          return data[column];
      }
    });
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center">
          <div className="bg-[#1a1f2b] w-full rounded-xl p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onSearchChange(e)
                  }
                  className="w-full bg-[#242935] text-gray-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={onboardingStatus}
                  onChange={(e) => setOnboardingStatus(e.target.value)}
                  className="bg-[#242935] text-gray-200 px-4 py-2 rounded-lg border border-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING_DISCOVERY">Pending Discovery</option>
                  <option value="DISCOVERY_INVITED">Discovery Invited</option>
                  <option value="DISCOVERY_SCHEDULED">Discovery Scheduled</option>
                  <option value="DISCOVERY_COMPLETED">Discovery Completed</option>
                  <option value="SCOPING_IN_PROGRESS">Scoping In Progress</option>
                  <option value="SCOPING_REVIEW">Scoping Review</option>
                  <option value="TERMS_PENDING">Terms Pending</option>
                  <option value="ONBOARDED">Onboarded</option>
                  <option value="REJECTED">Rejected</option>
                  {/* Include legacy options to filter existing data */}
                  <option value="NOT_STARTED">Not Started (Legacy)</option>
                  <option value="IN_PROGRESS">In Progress (Legacy)</option>
                  <option value="COMPLETED">Completed (Legacy)</option>
                </select>
                <button
                  onClick={() => {
                    setOnboardingStatus("all");
                    fetchClients();
                  }}
                  className="bg-[#242935] text-gray-200 px-3 py-2 rounded-lg border border-gray-700 hover:bg-[#2e3446]"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
        <table className="w-full min-w-full divide-y divide-gray-800 table-fixed">
          <thead>
            <tr className="bg-[#242935] sticky top-0 z-10">
              {header.map((h) => (
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4"
                  key={h}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[#1a1f2b] divide-y divide-gray-800">
            {data.map((d: any, index: any) => {
              return (
                <tr
                  key={d.id}
                  className={`transition-colors hover:bg-[#242935] ${
                    index % 2 === 0 ? "" : "bg-opacity-40 bg-[#242935]"
                  }`}
                >
                  {renderColumn(d)}
                </tr>
              );
            })}
          </tbody>
        {/* PAGINATION */}

          {pagination && (
            <tfoot>
              <tr>
                <td colSpan={columns.length}>{totalItems} items</td>
              </tr>
            </tfoot>
          )}
        </table>
        {/* PAGINATION */}
        {pagination && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button onClick={() => onPageChange(pageNumber - 1)}>
                Previous
              </button>
              <button onClick={() => onPageChange(pageNumber + 1)}>Next</button>
            </div>
          </div>
        )}
        {/* PAGE SIZE */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
        {/* MODEL COMES HERE */}
      {
        isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-[#1a1f2b] rounded-xl shadow-xl p-6 w-full max-w-3xl my-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-gray-200">
            Client Profile
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-400 hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1  gap-8">
          {/* Left column - Basic info */}
          <div className="col-span-1">
            <div className="flex flex-col justify-start mb-4">
              <h3 className="text-lg font-semibold text-gray-200">
                {profileData.fullName}
              </h3>
              <div className="mt-2">
                <StatusBadge status={profileData.onboardingStatus} className="bg-blue-600" />
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase">Email</h4>
                <p className="text-sm text-gray-200">{profileData.user.email}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase">Phone</h4>
                <p className="text-sm text-gray-200">{profileData.phoneNumber}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase">Organization</h4>
                <p className="text-sm text-gray-200">{profileData.organization}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase">Services Requested</h4>
                <p className="text-sm text-gray-200">{formatServiceName(profileData.requestedServices[0])}</p>
              </div>
              
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
        )
      }
    </>


  );
};

export default ClientsTable;

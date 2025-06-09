import { useState } from "react";

const Permissions = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [permissions, setPermissions] = useState<any[]>([
        {
            name: "Permission 1",
            description: "Permission 1 description"
        },
        
    ]);

    const OpenModal = () => {
        setIsModalOpen(true);
    }

    const CloseModal = () => {
        setIsModalOpen(false);
    }

    return (
    <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
        <h1 className="text-lg font-medium text-gray-200">Permissions</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={OpenModal}>Add Permission</button>
        </div>
        <div className="flex flex-col gap-4">
            {/* Make accordions with name and description */}
            {/* Make the accodrion  */}
            <div className="border-b border-gray-200">
                <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left px-4 py-3 flex justify-between items-center bg-transparent"
                >
                <span className="font-medium text-white">Permission 1</span>
                <span className="transform transition-transform duration-200 text-white" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                    ▼
                </span>
                </button>
                <div
                className={`overflow-hidden transition-all duration-300 px-4 ${isOpen ? "max-h-96 py-3" : "max-h-0"
                    }`}
                >
                <ol className="list-disc list-inside">
                    <li className="text-white w-full flex justify-between items-center py-2">
                        Read Permission 1
                        <input type="checkbox" className="ml-2" />
                    </li>
                    <li className="text-white w-full flex justify-between items-center py-2">
                        Write Permission 1
                        <input type="checkbox" className="ml-2" />
                    </li>
                    <li className="text-white w-full flex justify-between items-center py-2">
                        Update Permission 1
                        <input type="checkbox" className="ml-2" />
                    </li>
                    <li className="text-white w-full flex justify-between items-center py-2">
                        Delete Permission 1
                        <input type="checkbox" className="ml-2" />
                    </li>
                </ol>
                </div>
            </div>
             
        </div>
        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-4 rounded-md">
                    <h2 className="text-lg font-medium text-gray-200">Add Permission</h2>
                </div>
                {/* Form for adding a  new permission according to name        String         @unique
  description String?
  type        PermissionType
  resource    String // e.g., "projects", "clients", "consultants"

  // Relations
  roles RolePermission[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt */}
                <form>
                    <input type="text" placeholder="Name" />
                    <input type="text" placeholder="Description" />
                </form>
                <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={CloseModal}>Close</button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={AddPermission}>Add</button>
            </div>
        )}
    </div>
  )
}

export default Permissions
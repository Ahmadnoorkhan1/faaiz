import { useEffect, useState } from "react";
import ScopingFormBuilder from "./ScopingFormBuilder";
import api from "../../../service/apiService";
import ViewScopingForm from "./ViewScopingForm";
import toast from "react-hot-toast";
import EditScopingForm from "./EditScopingForm";

const ScopingForm = () => {
    const [scopingForms, setScopingForms] = useState<any>([]);
    useEffect(() => {
        getAllScopingForms();
    }, []);

    const [showFormBuilder, setShowFormBuilder] = useState('Table');
    const [selectedService, setSelectedService] = useState('');
    const [selectedForm, setSelectedForm] = useState('');
    const serviceOptions = [
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


      const renderScopingFormBuilder = (service:string) =>{
        setShowFormBuilder('Add');
        setSelectedService(service);
      }

      const renderExistingScopingForm = (service:string) => {
        setShowFormBuilder('View');
        setSelectedService(service);
        if(scopingForms.length>0){
            setSelectedForm(scopingForms.find((form:any)=>form.service===service));
        }
      }

      const getAllScopingForms = async () =>{
       try {
        const response:any = await api.get('/api/scoping-forms/get-all');
        setScopingForms(response.data);
       } catch (error) {
        toast.error('Error fetching scoping forms');
        console.log(error);
       }
      }

      const renderButtons=(service:string)=>{
        return scopingForms.map((forms:any)=>{
            if(forms.service === service){
                return(
                    <button className="bg-transparent text-blue-400 px-4 w-[75px] cursor-pointer " onClick={()=>renderExistingScopingForm(service)}>
                        View 
                    </button>
                )
            }else{
                return(
                    <button className="bg-transparent text-blue-400 px-4 w-[75px] cursor-pointer " onClick={()=>renderScopingFormBuilder(service)}>
                        Add 
                    </button>
                )
            }
        })
      }

      const renderScopingFormTable = () =>{
        return(
            <div>
            <h1 className="text-2xl font-normal text-gray-200 py-2">Scoping Form Along with Services</h1> 
                {/* i need two columns one for services and one for add form button */}
                <div className="">
                    {
                        serviceOptions.map((services:string, index:number)=>{
                            return(
                                <div key={index} className="grid grid-cols-2 ">
                                    <div className="col-span-2 border border-white p-4 ">
                                        <p className="text-gray-200">{services}</p>
                                    </div>
                                    <div className="col-3 border border-white flex justify-center">
                                    {renderButtons(services)}
                                    </div>
                                </div>
                            )
                        })
                    }
                    
                    
                </div>
            </div>
        )
      }

      const showScopingFormBuilder = () =>{

        switch(showFormBuilder){
            case 'Add':
                return <ScopingFormBuilder selectedService={selectedService} setShowFormBuilder={setShowFormBuilder} />
            case 'View':
                return <ViewScopingForm selectedService={selectedService} setShowFormBuilder={setShowFormBuilder} selectedForm={selectedForm} />
            case 'Table':
                return renderScopingFormTable();
            case 'Edit':
                return <EditScopingForm selectedService={selectedService} setShowFormBuilder={setShowFormBuilder} selectedForm={selectedForm} />
            default:
                return <></>;
        }
      }

return showScopingFormBuilder();
   
}

export default ScopingForm;
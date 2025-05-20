import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createScopingFormController = async (req, res) => {
  const { service, questions, createdById } = req.body;
  console.log({
    service,
    questions,
    createdById
  })

  try {
    const scopingForm = await prisma.scopingForm.create({
      data: {
        service,
        questions,
        // createdById:createdById,
        createdBy: {
          connect: {
            id: createdById,
          },
        },
      },
    });

    return res.status(201).json({
      success:true,
      message:"Scoping form created successfully",
      scopingForm
    });
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"Error creating scoping form",
      error:error.message
    });
  }
};

export const getAllScopingFormsController = async (req, res) => {
  try {
    const {
      orderBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;
    const scopingForms = await prisma.scopingForm.findMany({
      include: {
        createdBy: true,
        client: true,
      },
      orderBy: {
        [orderBy]: order,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    return res.status(200).json(scopingForms);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  } 
};

export const getScopingFormByServiceController = async (req, res) => {
  const { service } = req.body;

  try {
    // Only get template forms (where clientId is null)
    const scopingForms = await prisma.scopingForm.findMany({
      where: { 
        service,
        clientId: null // Add this filter to get only templates
      },
    });

    return res.status(200).json({
      success: true,
      message: "Scoping form templates retrieved successfully",
      data: scopingForms
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Error retrieving scoping form templates", 
      error: error.message 
    });
  }
};

export const updateScopingFormController = async (req, res) => {
  const { id, service, questions, createdById, clientId } = req.body;

  try {
    const scopingForm = await prisma.scopingForm.update({
      where: { id },
      data: { service, questions, createdById, clientId },
    });

    return res.status(200).json({
      success:true,
      message:"Scoping form updated successfully",
      scopingForm
    });
  } catch (error) {
    return res.status(500).json({ 
      success:false,
      message:"Error updating scoping form",
      error:error.message
    });
  }
};

export const deleteScopingFormController = async (req, res) => {
  const { id } = req.body;

  try {
    await prisma.scopingForm.delete({
      where: { id },
    });

    return res
      .status(200)
      .json({ message: "Scoping form deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get scoping form for a specific client and service
 * @route GET /api/scoping-forms/client/:clientId/service/:serviceType
 * @access Private
 */
// export const getClientScopingFormController = async (req, res) => {
//   try {
//     const { clientId, serviceType } = req.params;
    
//     // Check if client exists
//     const client = await prisma.clientProfile.findUnique({
//       where: { id: clientId },
//       include: { 
//         user: {
//           select: { id: true, email: true }
//         }
//       }
//     });
    
//     if (!client) {
//       return res.status(404).json({
//         success: false,
//         message: "Client not found"
//       });
//     }
    
//     // Get form template for this service type
//     const formTemplate = await prisma.scopingForm.findFirst({
//       where: {
//         service: serviceType,
//         clientId: null // Get the template form (not client-specific)
//       }
//     });
    
//     if (!formTemplate) {
//       return res.status(404).json({
//         success: false,
//         message: "Form template not found for this service type"
//       });
//     }
    
//     // Check if client has already filled this form
//     const clientForm = await prisma.scopingForm.findFirst({
//       where: {
//         clientId,
//         service: serviceType
//       }
//     });
    
//     // Prepare response with template questions and client answers if available
//     const response = {
//       clientId,
//       serviceType,
//       formId: formTemplate.id,
//       title: `${serviceType.replace(/_/g, ' ')} Scoping Form`,
//       questions: formTemplate.questions,
//       answers: clientForm?.answers || {},
//       status: clientForm?.status || 'PENDING',
//       lastUpdated: clientForm?.updatedAt || null
//     };
    
//     return res.status(200).json({
//       success: true,
//       message: "Scoping form retrieved successfully",
//       data: response
//     });
//   } catch (error) {
//     console.error('Error retrieving client scoping form:', error);
//     return res.status(500).json({
//       success: false,
//       message: "Error retrieving scoping form",
//       error: error.message
//     });
//   }
// };


export const getClientScopingFormController = async (req, res) => {
  try {
    const { clientId, serviceType } = req.params;
    
    // Check if client exists
    const client = await prisma.clientProfile.findUnique({
      where: { id: clientId },
      include: { 
        user: {
          select: { id: true, email: true }
        }
      }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }
    
    if (!client.user) {
      return res.status(404).json({
        success: false,
        message: "Client has no associated user account"
      });
    }
    
    // Get the User ID to look up client forms
    const userId = client.user.id;
    
    // Get form template for this service type
    const formTemplate = await prisma.scopingForm.findFirst({
      where: {
        service: serviceType,
        clientId: null // Get the template form (not client-specific)
      }
    });
    
    if (!formTemplate) {
      return res.status(404).json({
        success: false,
        message: "Form template not found for this service type"
      });
    }
    
    // Check if client has already filled this form - USING USER ID
    const clientForm = await prisma.scopingForm.findFirst({
      where: {
        clientId: userId, // Use User ID instead of ClientProfile ID
        service: serviceType
      }
    });
    
    // Extract notes from clientProfile if available
    const scopingDetails = client.scopingDetails 
      ? JSON.parse(client.scopingDetails) 
      : {};
      
    // Prepare response with template questions and client answers if available
    const response = {
      clientId,
      serviceType,
      formId: formTemplate.id,
      title: `${serviceType.replace(/_/g, ' ')} Scoping Form`,
      questions: formTemplate.questions,
      answers: clientForm?.answers || {},
      notes: scopingDetails.notes || client.adminReviewNotes || "",
      status: clientForm?.status || 'PENDING',
      lastUpdated: clientForm?.updatedAt || null
    };
    
    return res.status(200).json({
      success: true,
      message: "Scoping form retrieved successfully",
      data: response
    });
  } catch (error) {
    console.error('Error retrieving client scoping form:', error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving scoping form",
      error: error.message
    });
  }
};
/**
 * Get scoping form in HTML format for rendering
 * @route GET /api/scoping-forms/client/:clientId/service/:serviceType/html
 * @access Private
 */
export const getClientScopingFormHtmlController = async (req, res) => {
  try {
    const { clientId, serviceType } = req.params;
    
    // Get client information
    const client = await prisma.clientProfile.findUnique({
      where: { id: clientId },
      include: { 
        user: {
          select: { id: true, email: true }
        }
      }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }
    
    // Get form template
    const formTemplate = await prisma.scopingForm.findFirst({
      where: {
        service: serviceType,
        clientId: null // Get the template form
      }
    });
    
    if (!formTemplate) {
      return res.status(404).json({
        success: false,
        message: "Form template not found for this service type"
      });
    }
    
    // Get client's form submission if it exists
    const clientForm = await prisma.scopingForm.findFirst({
      where: {
        clientId,
        service: serviceType
      }
    });
    
    // Format the questions and answers for HTML rendering
    const questions = Array.isArray(formTemplate.questions) 
      ? formTemplate.questions 
      : (typeof formTemplate.questions === 'string' 
          ? JSON.parse(formTemplate.questions) 
          : formTemplate.questions);
    
    const answers = clientForm?.answers || {};
    
    // Generate HTML for the form
    let formHtml = `
      <div class="scoping-form">
        <h2>${serviceType.replace(/_/g, ' ')} Scoping Questionnaire</h2>
        <p>Client: ${client.fullName} (${client.organization})</p>
        <form id="scopingForm" data-client-id="${clientId}" data-service-type="${serviceType}">
    `;
    
    // Add each question and its answer if available
    Object.entries(questions).forEach(([questionId, questionData]) => {
      const question = typeof questionData === 'string' ? questionData : questionData.text || questionData.question;
      const questionType = typeof questionData === 'string' ? 'text' : questionData.type || 'text';
      const options = typeof questionData === 'string' ? [] : questionData.options || [];
      const answer = answers[questionId] || '';
      
      formHtml += `
        <div class="form-group mb-4">
          <label for="${questionId}" class="form-label">${question}</label>
      `;
      
      if (questionType === 'select' && options.length > 0) {
        formHtml += `
          <select id="${questionId}" name="${questionId}" class="form-control">
            <option value="">Select an option</option>
        `;
        
        options.forEach(option => {
          const isSelected = answer === option ? 'selected' : '';
          formHtml += `<option value="${option}" ${isSelected}>${option}</option>`;
        });
        
        formHtml += `</select>`;
      } else if (questionType === 'textarea') {
        formHtml += `
          <textarea id="${questionId}" name="${questionId}" class="form-control" rows="3">${answer}</textarea>
        `;
      } else {
        formHtml += `
          <input type="text" id="${questionId}" name="${questionId}" class="form-control" value="${answer}">
        `;
      }
      
      formHtml += `</div>`;
    });
    
    // Add notes field and submit button
    formHtml += `
        <div class="form-group mb-4">
          <label for="notes" class="form-label">Additional Notes</label>
          <textarea id="notes" name="notes" class="form-control" rows="4">${clientForm?.notes || ''}</textarea>
        </div>
        
        <div class="d-grid gap-2">
          <button type="submit" class="btn btn-primary btn-lg">Submit Scoping Form</button>
        </div>
      </form>
      
      <script>
        // Client-side validation and submission handling
        document.getElementById('scopingForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = new FormData(e.target);
          const clientId = e.target.dataset.clientId;
          const serviceType = e.target.dataset.serviceType;
          
          // Collect responses
          const responses = {};
          const notes = formData.get('notes');
          
          // Collect all question responses
          ${Object.keys(questions).map(id => `responses["${id}"] = formData.get("${id}");`).join('\n')}
          
          try {
            // Submit form
            const response = await fetch('/api/scoping-forms/client-submission', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
              },
              body: JSON.stringify({
                clientId,
                serviceType,
                responses,
                notes,
                status: 'SUBMITTED'
              })
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert('Scoping form submitted successfully!');
              // Redirect or show success message
            } else {
              alert('Error: ' + result.message);
            }
          } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred while submitting the form. Please try again.');
          }
        });
      </script>
    </div>
    `;
    
    return res.status(200).json({
      success: true,
      message: "Scoping form HTML generated successfully",
      data: {
        html: formHtml,
        client: {
          id: client.id,
          name: client.fullName,
          organization: client.organization
        },
        formStatus: clientForm?.status || 'PENDING'
      }
    });
  } catch (error) {
    console.error('Error generating HTML for scoping form:', error);
    return res.status(500).json({
      success: false,
      message: "Error generating HTML for scoping form",
      error: error.message
    });
  }
};


/**
 * Submit a scoping form for a client
 * @route POST /api/scoping-forms/client-submission
 * @access Private
 */
export const submitClientScopingFormController = async (req, res) => {
  try {
    const { clientId, serviceType, responses, notes, status } = req.body;
    
    // Validate required fields
    if (!clientId || !serviceType || !responses) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: clientId, serviceType, and responses are required"
      });
    }
    
    // Validate status
    const validStatuses = ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: PENDING, SUBMITTED, APPROVED, REJECTED"
      });
    }
    
    // Check if client profile exists and get the associated User ID
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { id: clientId },
      include: {
        user: {
          select: { id: true, email: true }
        }
      }
    });
    
    if (!clientProfile || !clientProfile.user) {
      return res.status(404).json({
        success: false,
        message: "Client not found or has no associated user"
      });
    }
    
    // Get the User ID from the ClientProfile
    const userId = clientProfile.user.id;
    
    // Enhanced responses without notes field - store notes separately
    const enhancedResponses = { ...responses };
    
    // Create or update scoping form
    const scopingForm = await prisma.$transaction(async (prisma) => {
      // Check if a scoping form for this client and service already exists
      const existingForm = await prisma.scopingForm.findFirst({
        where: {
          clientId: userId, // Use the User ID, not ClientProfile ID
          service: serviceType
        }
      });
      
      let form;
      
      if (existingForm) {
        // Update existing form
        form = await prisma.scopingForm.update({
          where: { id: existingForm.id },
          data: {
            answers: enhancedResponses,
            status: status || 'SUBMITTED',
            updatedAt: new Date()
          }
        });
      } else {
        // Get form template to get questions structure
        const template = await prisma.scopingForm.findFirst({
          where: {
            service: serviceType,
            clientId: null // Template has no client ID
          }
        });
        
        if (!template) {
          throw new Error("Form template not found for this service type");
        }
        
        // Create new form - using User ID for clientId
        form = await prisma.scopingForm.create({
          data: {
            service: serviceType,
            clientId: userId, // This is now the User ID
            createdById: req.user.id,
            questions: template.questions, 
            answers: enhancedResponses,
            status: status || 'SUBMITTED'
          }
        });
      }
      
      // Update client profile's onboarding status and store notes
      const updatedClient = await prisma.clientProfile.update({
        where: { id: clientId }, // Use ClientProfile ID here
        data: {
          onboardingStatus: 'SCOPING_REVIEW',
          adminReviewNotes: notes || clientProfile.adminReviewNotes || null,
          // Store additional details in scopingDetails JSON
          scopingDetails: JSON.stringify({
            service: serviceType,
            formId: form.id,
            notes: notes || '',
            submittedAt: new Date(),
            status: status || 'SUBMITTED'
          })
        }
      });
      
      return { form, client: updatedClient };
    });
    
    res.status(200).json({
      success: true,
      message: "Scoping form submitted successfully",
      data: {
        scopingForm: scopingForm.form,
        client: {
          id: scopingForm.client.id,
          onboardingStatus: scopingForm.client.onboardingStatus
        }
      }
    });
  } catch (error) {
    console.error('Error submitting scoping form:', error);
    return res.status(500).json({
      success: false,
      message: "Error submitting scoping form",
      error: error.message
    });
  }
};

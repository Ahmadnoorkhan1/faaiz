import nodemailer from 'nodemailer';

// Create a mock transporter for testing
const transporter = {
  sendMail: async (mailOptions) => {
    console.log('MOCK EMAIL SENT:', mailOptions);
    return { success: true, messageId: `mock-${Date.now()}@secureitlab.com` };
  }
};

// All email functions will use the mock transporter and return success

export const sendInterviewInvitation = async (consultant, interviewLink = null) => {
  const fullName = `${consultant.contactFirstName} ${consultant.contactLastName}`;
  
  console.log(`[MOCK] Sending interview invitation to ${fullName} (${consultant.email})`);
  
  // Keep the email template as is for future use
  const emailContent = `
    <h2>Interview Invitation</h2>
    <p>Dear ${fullName},</p>
    <p>We're pleased to invite you for an interview as part of our consultant onboarding process.</p>
    
    ${interviewLink ? `
    <p>Please use the following link to join the interview at the scheduled time:</p>
    <p><a href="${interviewLink}">${interviewLink}</a></p>
    ` : `
    <p>Our team will contact you shortly to schedule a convenient time for the interview.</p>
    `}
    
    <p>Please ensure you have the following ready for your interview:</p>
    <ul>
      <li>Your updated CV and certifications</li>
      <li>Portfolio of relevant projects</li>
      <li>Any questions you have about the consultancy role</li>
    </ul>
    
    <p>Thank you for your interest in joining our platform.</p>
    
    <p>Best regards,<br>
    The SecureITLab Team</p>
  `;
  
  // Return a success response without actually sending email
  return { success: true, messageId: `mock-${Date.now()}@secureitlab.com` };
};

// Do the same for other email functions
export const sendConsultantApprovalEmail = async (consultant) => {
  console.log(`[MOCK] Sending approval email to ${consultant.contactFirstName} ${consultant.contactLastName}`);
  return { success: true, messageId: `mock-${Date.now()}@secureitlab.com` };
};

export const sendConsultantRejectionEmail = async (consultant, reason = null) => {
  console.log(`[MOCK] Sending rejection email to ${consultant.contactFirstName} ${consultant.contactLastName}`);
  console.log(`Rejection reason: ${reason || 'None provided'}`);
  return { success: true, messageId: `mock-${Date.now()}@secureitlab.com` };
};
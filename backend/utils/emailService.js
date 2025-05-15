import nodemailer from 'nodemailer';

// Email service implementation
const transporter = {
  sendMail: async (mailOptions) => {
    console.log('Mock email sent:', mailOptions);
    return { success: true, messageId: `mock-${Date.now()}` };
  }
};

/**
 * Send interview invitation to consultant
 * @param {Object} consultant - Consultant profile with user data
 * @param {String} interviewLink - Meeting link for interview
 * @returns {Promise} - Email sending result
 */
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

/**
 * Send approval email to consultant
 * @param {Object} consultant - Consultant profile with user data
 * @returns {Promise} - Email sending result
 */
export const sendConsultantApprovalEmail = async (consultant) => {
  console.log(`[MOCK] Sending approval email to ${consultant.contactFirstName} ${consultant.contactLastName}`);
  return { success: true, messageId: `mock-${Date.now()}@secureitlab.com` };
};

/**
 * Send rejection email to consultant
 * @param {Object} consultant - Consultant profile with user data
 * @param {String} reason - Reason for rejection
 * @returns {Promise} - Email sending result
 */
export const sendConsultantRejectionEmail = async (consultant, reason = null) => {
  console.log(`[MOCK] Sending rejection email to ${consultant.contactFirstName} ${consultant.contactLastName}`);
  console.log(`Rejection reason: ${reason || 'None provided'}`);
  return { success: true, messageId: `mock-${Date.now()}@secureitlab.com` };
};

/**
 * Send discovery call invitation to client
 * @param {Object} client - Client profile with user data
 * @param {String} callLink - Meeting link for discovery call
 * @returns {Promise} - Email sending result
 */
export const sendClientDiscoveryInvitation = async (client, callLink) => {
  try {
    if (!client || !client.user || !client.user.email) {
      console.error('Invalid client data for email', client);
      return { success: false, error: 'Invalid client data' };
    }

    const mailOptions = {
      to: client.user.email,
      subject: 'Invitation for Discovery Call',
      html: `
        <h2>Hello ${client.fullName},</h2>
        <p>We're excited to learn more about your needs and how we can help your organization.</p>
        <p>You've been invited to a discovery call with our team. Please join us using the link below:</p>
        <p><a href="${callLink}" target="_blank">Join Discovery Call</a></p>
        <p>If you have any questions, please don't hesitate to reach out.</p>
        <p>Best regards,<br>The Team</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Discovery call invitation email sent', result);
    return { success: true };
  } catch (error) {
    console.error('Error sending discovery call invitation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send scoping notification to client
 * @param {Object} client - Client profile with user data
 * @returns {Promise} - Email sending result
 */
export const sendClientScopingNotification = async (client) => {
  try {
    if (!client || !client.user || !client.user.email) {
      console.error('Invalid client data for email', client);
      return { success: false, error: 'Invalid client data' };
    }

    const mailOptions = {
      to: client.user.email,
      subject: 'Your Project Scope is Ready for Review',
      html: `
        <h2>Hello ${client.fullName},</h2>
        <p>We're pleased to inform you that we've prepared the scope for your requested services.</p>
        <p>Please log in to your account to review the scope details and provide any feedback.</p>
        <p>If you have any questions, feel free to contact us.</p>
        <p>Best regards,<br>The Team</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Scoping notification email sent', result);
    return { success: true };
  } catch (error) {
    console.error('Error sending scoping notification:', error);
    return { success: false, error: error.message };
  }
};
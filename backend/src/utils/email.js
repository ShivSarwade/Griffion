const nodemailer = require('nodemailer');

let transporter = null;

const initializeTransporter = () => {
  if (!process.env.EMAIL_HOST) {
    console.warn('⚠️  Email not configured - email features disabled');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  return transporter;
};

const sendPasswordResetEmail = async (email, resetToken) => {
  if (!transporter) {
    transporter = initializeTransporter();
  }

  if (!transporter) {
    console.warn('Cannot send email - SMTP not configured');
    return;
  }

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendAccountCreatedEmail = async (email, password, role, firstName = 'User') => {
  if (!transporter) {
    transporter = initializeTransporter();
  }

  if (!transporter) {
    console.warn('Cannot send email - SMTP not configured');
    return;
  }

  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Your Account Has Been Created',
    html: `
      <h2>Welcome ${firstName}!</h2>
      <p>Your account has been successfully created in ${process.env.PROJECT_NAME || 'Griffion'}.</p>
      
      <h3>Login Details:</h3>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
          <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Password:</td>
          <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${password}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Role:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${role}</td>
        </tr>
      </table>

      <h3>⚠️ Important Security Notice:</h3>
      <ol>
        <li><strong>Login immediately</strong> using the credentials above at: <a href="${loginUrl}">${loginUrl}</a></li>
        <li><strong>Change your password</strong> immediately after your first login</li>
        <li><strong>Do not share</strong> these credentials with anyone</li>
        <li>Keep this email in a secure location</li>
      </ol>

      <h3>First Login Steps:</h3>
      <ol>
        <li>Go to <a href="${loginUrl}">Login Page</a></li>
        <li>Enter the email and password provided above</li>
        <li>Navigate to Profile Settings → Change Password</li>
        <li>Create a strong, unique password</li>
        <li>Consider enabling Two-Factor Authentication (2FA) for extra security</li>
      </ol>

      <p style="color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px;">
        If you did not expect this email or have any questions, please contact your administrator immediately.
      </p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Account created email sent to:', email);
  } catch (error) {
    console.error('Error sending account creation email:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendAccountCreatedEmail
};

import nodemailer from 'nodemailer';

export type MailerConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

export function getMailerConfig(): MailerConfig {
  const host = process.env.SMTP_HOST || '';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.FROM_EMAIL || process.env.SMTP_FROM || '';
  const secure = port === 465;
  if (!host || !user || !pass || !from) {
    throw new Error('SMTP configuration is incomplete');
  }
  return { host, port, secure, user, pass, from };
}

export function createTransport() {
  const cfg = getMailerConfig();
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
}

export async function sendDemoRequestEmail(opts: {
  cafeName: string;
  ownerName: string;
  email: string;
  city: string;
  location: string;
  startDate: string;
  contactNumber: string;
}) {
  const { cafeName, ownerName, email, city, location, startDate, contactNumber } = opts;
  const transporter = createTransport();
  const subject = `🚀 New Demo Request - ${cafeName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Demo Request - SmartDini</title>
      ${emailStyles}
    </head>
    <body>
      <div class="email-card">
        <div class="email-header">
          <h1>Smart<span>Dini</span></h1>
          <p>New Demo Request</p>
        </div>
        <div class="email-content">
          <div class="greeting">
            New demo request from <span class="greeting-highlight">${ownerName}</span> 👋
          </div>
          <div class="message">
            You've received a new demo request through the SmartDini website.
            Here are the details:
          </div>
          <div class="badge">🚀 New Demo Request</div>
          <div class="section-card">
            <div class="section-title">
              <span class="section-title-icon">📝</span>
              Submission Details
            </div>
            <div class="link-container">
              <div class="link-label">Cafe Name</div>
              <div class="link-value">${cafeName}</div>
            </div>
            <div class="link-container">
              <div class="link-label">Owner Name</div>
              <div class="link-value">${ownerName}</div>
            </div>
            <div class="link-container">
              <div class="link-label">Email Address</div>
              <div class="link-value">
                <a href="mailto:${email}">${email}</a>
              </div>
            </div>
            <div class="link-container">
              <div class="link-label">Contact Number</div>
              <div class="link-value">${contactNumber}</div>
            </div>
            <div class="link-container">
              <div class="link-label">City</div>
              <div class="link-value">${city}</div>
            </div>
            <div class="link-container">
              <div class="link-label">Location</div>
              <div class="link-value">${location}</div>
            </div>
            <div class="link-container">
              <div class="link-label">Proposed Start Date</div>
              <div class="link-value">${startDate}</div>
            </div>
          </div>
          <div class="button-container">
            <a href="mailto:${email}" class="button">
              Reply to ${ownerName} →
            </a>
          </div>
          <div class="divider"></div>
        </div>
        <div class="email-footer">
          <div class="footer-logo">SmartDini</div>
          <div class="footer-text">
            <p>SmartDini Admin Notification System</p>
            <p style="margin-top: 16px;">
              © ${new Date().getFullYear()} SmartDini. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
NEW DEMO REQUEST

Cafe Name: ${cafeName}
Owner Name: ${ownerName}
Email: ${email}
Contact Number: ${contactNumber}
City: ${city}
Location: ${location}
Start Date: ${startDate}

Reply to: ${email}

© ${new Date().getFullYear()} SmartDini. All rights reserved.
  `;

  await transporter.sendMail({
    from: `"SmartDini" <${getMailerConfig().from}>`,
    to: process.env.ADMIN_EMAIL || getMailerConfig().from,
    subject,
    html,
    text,
    replyTo: email,
  });
}

// Professional email styles matching app theme
const emailStyles = `
  <style>
    /* Reset */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    /* Main container */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #1e293b;
      background-color: #f8fafc;
      margin: 0;
      padding: 20px;
    }
    
    /* Email card - matches app card style */
    .email-card {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid #f1f5f9;
    }
    
    /* Header - matches app header */
    .email-header {
      background: linear-gradient(135deg, #D92632 0%, #B71C1C 100%);
      padding: 32px 40px;
      text-align: center;
    }
    
    .email-header h1 {
      color: white;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin: 0;
    }
    
    .email-header h1 span {
      font-weight: 300;
      opacity: 0.95;
    }
    
    .email-header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin-top: 8px;
      font-weight: 400;
    }
    
    /* Content area - matches app padding */
    .email-content {
      padding: 40px;
    }
    
    /* Greeting */
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 8px;
    }
    
    .greeting-highlight {
      color: #D92632;
    }
    
    /* Message text */
    .message {
      color: #475569;
      font-size: 15px;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    
    /* Badge - matches app badge style */
    .badge {
      display: inline-block;
      background-color: #FEE2E2;
      color: #D92632;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 9999px;
      margin-bottom: 24px;
      border: 1px solid #FECACA;
    }
    
    /* Section card - matches app gray cards */
    .section-card {
      background-color: #F8FAFC;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      border: 1px solid #F1F5F9;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
    }
    
    .section-title-icon {
      font-size: 18px;
    }
    
    /* Link container - matches app link style */
    .link-container {
      background-color: #ffffff;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      transition: all 0.2s ease;
    }
    
    .link-container:last-child {
      margin-bottom: 0;
    }
    
    .link-label {
      font-size: 12px;
      color: #94A3B8;
      margin-bottom: 4px;
    }
    
    .link-value {
      font-size: 15px;
      font-weight: 500;
      word-break: break-all;
    }
    
    .link-value a {
      color: #D92632;
      text-decoration: none;
      font-weight: 500;
    }
    
    .link-value a:hover {
      text-decoration: underline;
    }
    
    /* Credentials grid - 2 column layout */
    .credentials-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }
    
    .credential-box {
      background-color: #ffffff;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 16px;
    }
    
    .credential-label {
      font-size: 11px;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .credential-value {
      font-size: 15px;
      font-weight: 600;
      color: #0f172a;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
    }
    
    /* OTP container - matches app OTP style */
    .otp-container {
      background-color: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      margin: 24px 0;
    }
    
    .otp-label {
      font-size: 12px;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    
    .otp-code {
      font-size: 40px;
      font-weight: 700;
      letter-spacing: 8px;
      color: #D92632;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
      margin-bottom: 12px;
    }
    
    .otp-expiry {
      font-size: 13px;
      color: #64748B;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    
    /* Button - matches app button */
    .button {
      display: inline-block;
      background-color: #D92632;
      color: white !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s ease;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(217, 38, 50, 0.2);
    }
    
    .button:hover {
      background-color: #B71C1C;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(217, 38, 50, 0.3);
    }
    
    .button-container {
      text-align: center;
      margin: 32px 0 16px;
    }
    
    /* Divider */
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #E2E8F0, transparent);
      margin: 32px 0;
    }
    
    /* Info box */
    .info-box {
      background-color: #FEF9C3;
      border: 1px solid #FDE047;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      gap: 12px;
      margin: 16px 0;
    }
    
    .info-icon {
      font-size: 20px;
      line-height: 1;
    }
    
    .info-content {
      flex: 1;
    }
    
    .info-title {
      font-weight: 600;
      color: #854D0E;
      margin-bottom: 4px;
      font-size: 14px;
    }
    
    .info-text {
      font-size: 13px;
      color: #92400E;
      line-height: 1.5;
    }
    
    /* Warning box */
    .warning-box {
      background-color: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      gap: 12px;
      margin: 16px 0;
    }
    
    .warning-title {
      font-weight: 600;
      color: #991B1B;
      margin-bottom: 4px;
      font-size: 14px;
    }
    
    .warning-text {
      font-size: 13px;
      color: #B91C1C;
      line-height: 1.5;
    }
    
    /* Success box */
    .success-box {
      background-color: #F0FDF4;
      border: 1px solid #86EFAC;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      gap: 12px;
      margin: 16px 0;
    }
    
    /* Footer - matches app footer style */
    .email-footer {
      background-color: #F8FAFC;
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid #F1F5F9;
    }
    
    .footer-logo {
      font-size: 20px;
      font-weight: 700;
      color: #D92632;
      margin-bottom: 16px;
    }
    
    .footer-text {
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.8;
    }
    
    .footer-text a {
      color: #D92632;
      text-decoration: none;
      font-weight: 500;
    }
    
    .footer-text a:hover {
      text-decoration: underline;
    }
    
    .social-links {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin: 20px 0 16px;
    }
    
    .social-link {
      color: #94A3B8;
      text-decoration: none;
      font-size: 13px;
    }
    
    .social-link:hover {
      color: #D92632;
    }
    
    /* Responsive */
    @media (max-width: 600px) {
      .email-content {
        padding: 24px;
      }
      
      .email-header {
        padding: 24px;
      }
      
      .credentials-grid {
        grid-template-columns: 1fr;
      }
      
      .otp-code {
        font-size: 32px;
        letter-spacing: 4px;
      }
      
      .email-footer {
        padding: 24px;
      }
    }
    
    /* List styles */
    .feature-list {
      list-style: none;
      padding: 0;
    }
    
    .feature-list li {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      color: #475569;
      font-size: 14px;
      border-bottom: 1px solid #F1F5F9;
    }
    
    .feature-list li:last-child {
      border-bottom: none;
    }
    
    .feature-list li:before {
      content: "✓";
      color: #D92632;
      font-weight: 600;
    }
  </style>
`;

export async function sendCafeWelcomeEmail(opts: {
  to: string;
  cafeName: string;
  ownerName?: string;
  menuUrl: string;
  adminUrl: string;
  username?: string;
  password?: string;
}) {
  const { to, cafeName, ownerName, menuUrl, adminUrl, username, password } = opts;
  const transporter = createTransport();
  const subject = `🎉 Welcome to SmartDini – ${cafeName} is now live!`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SmartDini</title>
      ${emailStyles}
    </head>
    <body>
      <div class="email-card">
        <!-- Header with app branding -->
        <div class="email-header">
          <h1>Smart<span>Dini</span></h1>
          <p>Digital Menu & Ordering System</p>
        </div>
        
        <!-- Main content -->
        <div class="email-content">
          <div class="greeting">
            Hello${ownerName ? `, ${ownerName}` : ''} <span class="greeting-highlight">👋</span>
          </div>
          
          <div class="message">
            We're thrilled to inform you that <strong>${cafeName}</strong> has been successfully 
            registered on SmartDini. Your digital presence is now live and ready to serve your customers.
          </div>
          
          <div class="badge">✨ Registration Complete</div>
          
          <!-- Important Links Section -->
          <div class="section-card">
            <div class="section-title">
              <span class="section-title-icon">🔗</span>
              Your Cafe Access Links
            </div>
            
            <div class="link-container">
              <div class="link-label">Public Menu Page</div>
              <div class="link-value">
                <a href="${menuUrl}" target="_blank" rel="noopener noreferrer">${menuUrl}</a>
              </div>
              <div style="font-size: 12px; color: #94A3B8; margin-top: 4px;">
                Share this link with your customers
              </div>
            </div>
            
            <div class="link-container">
              <div class="link-label">Admin Dashboard</div>
              <div class="link-value">
                <a href="${adminUrl}" target="_blank" rel="noopener noreferrer">${adminUrl}</a>
              </div>
              <div style="font-size: 12px; color: #94A3B8; margin-top: 4px;">
                Private access for managing your cafe
              </div>
            </div>
          </div>
          
          ${username && password ? `
            <!-- Credentials Section -->
            <div class="section-card">
              <div class="section-title">
                <span class="section-title-icon">🔐</span>
                Admin Credentials
              </div>
              
              <div class="credentials-grid">
                <div class="credential-box">
                  <div class="credential-label">Username</div>
                  <div class="credential-value">${username}</div>
                </div>
                <div class="credential-box">
                  <div class="credential-label">Password</div>
                  <div class="credential-value">••••••••</div>
                </div>
              </div>
              
              <div class="info-box" style="margin-top: 16px;">
                <span class="info-icon">🔒</span>
                <div class="info-content">
                  <div class="info-title">Keep this information safe</div>
                  <div class="info-text">
                    Please save these credentials securely. You'll need them to access your admin dashboard. 
                    Never share your password with anyone.
                  </div>
                </div>
              </div>
            </div>
          ` : ''}
          
          <!-- What's Next Section -->
          <div class="section-card">
            <div class="section-title">
              <span class="section-title-icon">🚀</span>
              Getting Started
            </div>
            
            <ul class="feature-list">
              <li>Log in to your admin dashboard using the credentials above</li>
              <li>Add your menu items with prices and descriptions</li>
              <li>Upload high-quality photos of your dishes</li>
              <li>Organize items into categories</li>
              <li>Start accepting orders from customers</li>
            </ul>
          </div>
          
          <!-- CTA Button -->
          <div class="button-container">
            <a href="${adminUrl}" class="button" target="_blank" rel="noopener noreferrer">
              Go to Dashboard →
            </a>
          </div>
          
          <div class="divider"></div>
          
          <!-- Support Info -->
          <div style="text-align: center; color: #64748B; font-size: 13px;">
            <p>Need assistance? Our support team is here to help</p>
            <p style="margin-top: 8px;">
              📧 <a href="mailto:support@smartdini.com" style="color: #D92632; text-decoration: none;">support@smartdini.com</a>
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
          <div class="footer-logo">SmartDini</div>
          <div class="footer-text">
            <p>Making restaurant menus digital, one cafe at a time.</p>
            
            <div class="social-links">
              <a href="#" class="social-link">Twitter</a>
              <a href="#" class="social-link">LinkedIn</a>
              <a href="#" class="social-link">Instagram</a>
            </div>
            
            <p style="margin-top: 16px;">
              This is an automated message, please do not reply.<br>
              © ${new Date().getFullYear()} SmartDini. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
WELCOME TO SMARTDINI

Hello${ownerName ? `, ${ownerName}` : ''},

We're thrilled to inform you that ${cafeName} has been successfully registered on SmartDini. Your digital presence is now live and ready to serve your customers.

🔗 YOUR CAFE ACCESS LINKS
-------------------------
Public Menu Page (Share with customers):
${menuUrl}

Admin Dashboard (Private access):
${adminUrl}

${username && password ? `
🔐 ADMIN CREDENTIALS
--------------------
Username: ${username}
Password: [saved securely]

⚠️ Please save these credentials securely. You'll need them to access your admin dashboard. Never share your password with anyone.
` : ''}

🚀 GETTING STARTED
------------------
• Log in to your admin dashboard using the credentials above
• Add your menu items with prices and descriptions
• Upload high-quality photos of your dishes
• Organize items into categories
• Start accepting orders from customers

Need assistance? Contact our support team:
📧 support@smartdini.com

---
Making restaurant menus digital, one cafe at a time.
© ${new Date().getFullYear()} SmartDini. All rights reserved.
  `;
  
  await transporter.sendMail({
    from: `"SmartDini" <${getMailerConfig().from}>`,
    to,
    subject,
    html,
    text,
  });
}

export async function sendContactFormEmail(opts: {
  contactNo: string;
  email: string;
  cafeLocation: string;
  cafeCity: string;
}) {
  const { contactNo, email, cafeLocation, cafeCity } = opts;
  const transporter = createTransport();
  const subject = `📩 New Contact Form Submission - ${email}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Inquiry - SmartDini</title>
      ${emailStyles}
    </head>
    <body>
      <div class="email-card">
        <div class="email-header">
          <h1>Smart<span>Dini</span></h1>
          <p>Contact Form Inquiry</p>
        </div>
        
        <div class="email-content">
          <div class="greeting">
            New message from <span class="greeting-highlight">${email}</span> 👋
          </div>
          
          <div class="message">
            You've received a new inquiry through the SmartDini contact form. 
            Here are the details:
          </div>
          
          <div class="badge">📬 New Inquiry Received</div>
          
          <!-- Inquiry Details Section -->
          <div class="section-card">
            <div class="section-title">
              <span class="section-title-icon">📝</span>
              Submission Details
            </div>
            
            <div class="link-container">
              <div class="link-label">Contact Number</div>
              <div class="link-value">${contactNo}</div>
            </div>
            
            <div class="link-container">
              <div class="link-label">Email Address</div>
              <div class="link-value">
                <a href="mailto:${email}">${email}</a>
              </div>
            </div>
            
            <div class="link-container">
              <div class="link-label">Cafe Location</div>
              <div class="link-value">${cafeLocation}</div>
            </div>

            <div class="link-container">
              <div class="link-label">Cafe City</div>
              <div class="link-value">${cafeCity}</div>
            </div>
          </div>
          
          <div class="button-container">
            <a href="mailto:${email}" class="button">
              Reply to ${email} →
            </a>
          </div>
          
          <div class="divider"></div>
        </div>
        
        <div class="email-footer">
          <div class="footer-logo">SmartDini</div>
          <div class="footer-text">
            <p>SmartDini Admin Notification System</p>
            <p style="margin-top: 16px;">
              © ${new Date().getFullYear()} SmartDini. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
NEW CONTACT FORM SUBMISSION

Contact Number: ${contactNo}
Email: ${email}
Cafe Location: ${cafeLocation}
Cafe City: ${cafeCity}

Reply to: ${email}

© ${new Date().getFullYear()} SmartDini. All rights reserved.
  `;
  
  await transporter.sendMail({
    from: `"SmartDini" <${getMailerConfig().from}>`,
    to: process.env.ADMIN_EMAIL || getMailerConfig().from,
    subject,
    html,
    text,
    replyTo: email,
  });
}
export async function sendPasswordOtpEmail(opts: { to: string; cafeName: string; otp: string }) {
  const { to, cafeName, otp } = opts;
  const transporter = createTransport();
  const subject = `🔐 SmartDini - Password Reset Verification Code`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - SmartDini</title>
      ${emailStyles}
    </head>
    <body>
      <div class="email-card">
        <div class="email-header">
          <h1>Smart<span>Dini</span></h1>
          <p>Password Reset Request</p>
        </div>
        
        <div class="email-content">
          <div class="greeting">
            Security Verification <span class="greeting-highlight">🔒</span>
          </div>
          
          <div class="message">
            We received a request to reset the password for <strong>${cafeName}</strong>.
            Use the verification code below to complete the process.
          </div>
          
          <!-- OTP Container -->
          <div class="otp-container">
            <div class="otp-label">Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">
              <span>⏰</span> Expires in 10 minutes
            </div>
          </div>
          
          <!-- Warning Box -->
          <div class="warning-box">
            <span class="info-icon">⚠️</span>
            <div class="info-content">
              <div class="warning-title">Didn't request this?</div>
              <div class="warning-text">
                If you didn't request a password reset, you can safely ignore this email. 
                Your account remains secure and no changes have been made.
              </div>
            </div>
          </div>
          
          <!-- Security Tips -->
          <div class="section-card" style="margin-top: 16px;">
            <div class="section-title">
              <span class="section-title-icon">🛡️</span>
              Security Tips
            </div>
            <ul class="feature-list" style="margin-top: 8px;">
              <li>Never share this code with anyone</li>
              <li>SmartDini will never ask for your password</li>
              <li>Use a strong, unique password</li>
              <li>Enable two-factor authentication if available</li>
            </ul>
          </div>
        </div>
        
        <div class="email-footer">
          <div class="footer-logo">SmartDini</div>
          <div class="footer-text">
            <p>For security, never share verification codes.</p>
            <p style="margin-top: 16px;">
              Need help? <a href="mailto:support@smartdini.com">support@smartdini.com</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
SMARTDINI PASSWORD RESET

We received a request to reset the password for ${cafeName}.

Your verification code is: ${otp}

⏰ This code expires in 10 minutes.

⚠️ If you didn't request this password reset, please ignore this email. Your account remains secure.

SECURITY TIPS:
• Never share this code with anyone
• SmartDini will never ask for your password
• Use a strong, unique password

Need help? Contact support@smartdini.com

© ${new Date().getFullYear()} SmartDini. All rights reserved.
  `;
  
  await transporter.sendMail({
    from: `"SmartDini" <${getMailerConfig().from}>`,
    to,
    subject,
    html,
    text,
  });
}

export async function sendPasswordResetConfirmationEmail(opts: { to: string; cafeName: string; username?: string }) {
  const { to, cafeName, username } = opts;
  const transporter = createTransport();
  const subject = `✅ SmartDini - Password Changed Successfully`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed - SmartDini</title>
      ${emailStyles}
    </head>
    <body>
      <div class="email-card">
        <div class="email-header">
          <h1>Smart<span>Dini</span></h1>
          <p>Security Notification</p>
        </div>
        
        <div class="email-content">
          <div class="greeting">
            Password Updated <span class="greeting-highlight">✅</span>
          </div>
          
          <div class="message">
            The password for <strong>${cafeName}${username ? ` (${username})` : ''}</strong> 
            was just changed successfully.
          </div>
          
          <!-- Success Box -->
          <div class="success-box">
            <span class="info-icon">🔒</span>
            <div class="info-content">
              <div class="info-title" style="color: #166534;">Password Changed</div>
              <div class="info-text" style="color: #166534;">
                This change was made just now from your account. 
                If you made this change, no further action is needed.
              </div>
            </div>
          </div>
          
          <!-- Warning Box -->
          <div class="warning-box">
            <span class="info-icon">⚠️</span>
            <div class="info-content">
              <div class="warning-title">Didn't make this change?</div>
              <div class="warning-text">
                If you did not perform this action, please contact support immediately 
                to secure your account. Your account security is our top priority.
              </div>
            </div>
          </div>
          
          <!-- Immediate Actions -->
          <div class="section-card" style="margin-top: 16px;">
            <div class="section-title">
              <span class="section-title-icon">⚡</span>
              Recommended Actions
            </div>
            <ul class="feature-list">
              <li>Review your account activity</li>
              <li>Update security questions</li>
              <li>Enable two-factor authentication</li>
              <li>Contact support if you notice anything unusual</li>
            </ul>
          </div>
        </div>
        
        <div class="email-footer">
          <div class="footer-logo">SmartDini</div>
          <div class="footer-text">
            <p>This is a security notification about your account.</p>
            <p style="margin-top: 16px;">
              Need help? <a href="mailto:support@smartdini.com">support@smartdini.com</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
SMARTDINI PASSWORD CHANGE CONFIRMATION

The password for ${cafeName}${username ? ` (${username})` : ''} was just changed successfully.

✅ If you made this change, no further action is needed.

⚠️ If you did NOT make this change, please contact support immediately to secure your account.

RECOMMENDED ACTIONS:
• Review your account activity
• Update security questions
• Enable two-factor authentication
• Contact support if you notice anything unusual

Need help? Contact support@smartdini.com

© ${new Date().getFullYear()} SmartDini. All rights reserved.
  `;
  
  await transporter.sendMail({
    from: `"SmartDini" <${getMailerConfig().from}>`,
    to,
    subject,
    html,
    text,
  });
}
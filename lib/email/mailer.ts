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
  const subject = `Welcome to Smartdini – ${cafeName} is registered`;
  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height:1.5; color:#111; max-width:560px; margin:auto;">
      <h2 style="color:#D92632; margin-bottom:8px;">${cafeName} is registered</h2>
      <p>Hi${ownerName ? ' ' + ownerName : ''},</p>
      <p>Your cafe has been registered successfully on Smartdini.</p>
      <p><strong>Menu Page:</strong> <a href="${menuUrl}" target="_blank" rel="noopener noreferrer">${menuUrl}</a></p>
      <p><strong>Admin Page:</strong> <a href="${adminUrl}" target="_blank" rel="noopener noreferrer">${adminUrl}</a></p>
      ${username && password ? `<p><strong>Username:</strong> ${username}<br/><strong>Password:</strong> ${password}</p>` : ''}
      <hr />
      <p style="font-size:12px;color:#555;">This is an automated message. Please do not reply.</p>
    </div>
  `;
  const text = `Cafe ${cafeName} registered.\nMenu: ${menuUrl}\nAdmin: ${adminUrl}`;
  await transporter.sendMail({
    from: `"Smartdini" <${getMailerConfig().from}>`,
    to,
    subject,
    html,
    text,
  });
}

export async function sendPasswordOtpEmail(opts: { to: string; cafeName: string; otp: string }) {
  const { to, cafeName, otp } = opts;
  const transporter = createTransport();
  const subject = `Smartdini Password Reset Code`;
  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height:1.5; color:#111; max-width:560px; margin:auto;">
      <h2 style="color:#D92632; margin-bottom:8px;">Password Reset</h2>
      <p>We received a request to reset the password for ${cafeName}.</p>
      <p>Use the following one-time code. It expires in 10 minutes.</p>
      <div style="margin:16px 0; font-size:28px; font-weight:700; letter-spacing:6px; color:#D92632;">${otp}</div>
      <p>If you didn’t request this, you can ignore this email.</p>
      <hr />
      <p style="font-size:12px;color:#555;">This is an automated message from Smartdini.</p>
    </div>
  `;
  const text = `Password Reset Code for ${cafeName}\nCode: ${otp}\nExpires in 10 minutes.`;
  await transporter.sendMail({
    from: `"Smartdini" <${getMailerConfig().from}>`,
    to,
    subject,
    html,
    text,
  });
}

export async function sendPasswordResetConfirmationEmail(opts: { to: string; cafeName: string; username?: string }) {
  const { to, cafeName, username } = opts;
  const transporter = createTransport();
  const subject = `Your Smartdini password was reset`;
  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height:1.5; color:#111; max-width:560px; margin:auto;">
      <h2 style="color:#D92632; margin-bottom:8px;">Password Reset Successful</h2>
      <p>The password for ${cafeName}${username ? ' (' + username + ')' : ''} was changed just now.</p>
      <p>If you did not perform this action, please contact support immediately.</p>
      <hr />
      <p style="font-size:12px;color:#555;">This is an automated message from Smartdini.</p>
    </div>
  `;
  const text = `Password for ${cafeName}${username ? ' (' + username + ')' : ''} was reset.`;
  await transporter.sendMail({
    from: `"Smartdini" <${getMailerConfig().from}>`,
    to,
    subject,
    html,
    text,
  });
}

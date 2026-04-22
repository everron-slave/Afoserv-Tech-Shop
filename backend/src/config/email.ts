import dotenv from 'dotenv';

dotenv.config();

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
  sendGridApiKey?: string;
  useSendGrid: boolean;
}

export const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  user: process.env.SMTP_USER || 'apikey',
  password: process.env.SMTP_PASSWORD || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@aforsev.com',
  fromName: process.env.FROM_NAME || 'AFORSEV E-commerce',
  sendGridApiKey: process.env.SENDGRID_API_KEY,
  useSendGrid: !!process.env.SENDGRID_API_KEY,
};

export const isEmailConfigured = (): boolean => {
  if (emailConfig.useSendGrid) {
    return !!emailConfig.sendGridApiKey;
  }
  return !!emailConfig.host && !!emailConfig.user && !!emailConfig.password;
};
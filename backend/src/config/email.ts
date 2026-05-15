import dotenv from 'dotenv';

dotenv.config();

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
  adminEmail: string;
}

export const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  user: process.env.SMTP_USER || '',
  password: process.env.SMTP_PASSWORD || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@aforsev.com',
  fromName: process.env.FROM_NAME || 'AFORSEV E-commerce',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@aforsev.com',
};

export const isEmailConfigured = (): boolean => {
  return !!emailConfig.host && !!emailConfig.user && !!emailConfig.password;
};

export const getAdminEmail = (): string => {
  return emailConfig.adminEmail;
};
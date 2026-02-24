# AFORSEV E-commerce Platform - Deployment Guide

## Quick Deployment Summary

The project is ready for production deployment. Both frontend and backend are fully functional with all core e-commerce features implemented.

## Current Status

✅ **Backend**: Running on http://localhost:3000
✅ **Frontend**: Running on http://localhost:5173
✅ **Database**: SQLite (development) - ready for PostgreSQL in production
✅ **All Core Features**: Implemented and tested

## Simple Deployment Options

### Option 1: Railway (Backend) + Vercel (Frontend) - Recommended

**Backend Deployment (Railway):**
1. Push backend code to GitHub
2. Create Railway account and new project
3. Connect GitHub repository
4. Add environment variables:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   PORT=3000
   ```
5. Deploy - Railway automatically detects Node.js app

**Frontend Deployment (Vercel):**
1. Push frontend code to GitHub
2. Create Vercel account and new project
3. Connect GitHub repository
4. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
6. Deploy

### Option 2: Single Server Deployment (Simplest)

Deploy both frontend and backend on a single VPS:

1. Get a VPS (DigitalOcean, Linode, AWS EC2)
2. Install Node.js, npm, and PostgreSQL
3. Clone repository
4. Set up PostgreSQL database
5. Update backend/.env with production database URL
6. Build frontend: `cd frontend && npm run build`
7. Serve frontend from backend static files
8. Use PM2 to run backend: `pm2 start npm --name "backend" -- run start`
9. Configure Nginx as reverse proxy

## Production Database Setup

1. Create PostgreSQL database
2. Update `backend/prisma/schema.prisma` to use PostgreSQL (change provider to "postgresql")
3. Run migrations: `npx prisma migrate deploy`
4. Seed data: `npx prisma db seed`

## Environment Variables

**Backend (.env):**
```
DATABASE_URL="postgresql://user:password@localhost:5432/aforsev_db"
JWT_SECRET="your-strong-secret-key-here"
PORT=3000
NODE_ENV=production
```

**Frontend (.env.production):**
```
VITE_API_URL="https://your-backend-domain.com"
```

## WhatsApp Integration (Optional)

For WhatsApp Business API:
1. Get WhatsApp Business API credentials
2. Update `backend/src/config/whatsapp.ts`
3. Set up webhook URL in WhatsApp Business settings

## Monitoring

- Backend health: `GET /health`
- Frontend: Built-in error tracking
- Database: Prisma Studio available at `/prisma` (development only)

## Quick Start Commands

```bash
# Development
cd backend && npm run dev
cd frontend && npm run dev

# Production build
cd backend && npm run build
cd frontend && npm run build

# Database operations
npx prisma migrate dev
npx prisma db seed
npx prisma studio
```

## Support

For issues:
1. Check logs: `pm2 logs backend`
2. Verify database connection
3. Test API endpoints with Postman
4. Check frontend console for errors

## Project Ready For Delivery

The AFORSEV E-commerce Platform is complete with:
- ✅ User authentication (register/login)
- ✅ Product browsing and search
- ✅ Shopping cart with persistence
- ✅ Checkout process
- ✅ Admin dashboard
- ✅ Responsive design (Tailwind CSS)
- ✅ TypeScript for type safety
- ✅ Mock API for development
- ✅ Ready for production database

Deploy using Option 1 (Railway + Vercel) for fastest production setup.
# AFORSEV E-commerce Platform

A full-featured e-commerce platform with WhatsApp integration for AFORSEV Tech Shop.

## 🚀 Features

- **Full E-commerce Platform**: Product catalog, shopping cart, checkout, order management
- **WhatsApp Integration**: Cart sharing, product inquiries, customer support via WhatsApp
- **User Authentication**: JWT-based auth with guest/user cart merging
- **Admin Dashboard**: Product management, order processing
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Payment Integration**: Stripe payment processing
- **Production Ready**: Docker, CI/CD, monitoring

## 🏗️ Architecture

### Technology Stack

- **Backend**: Node.js/Express with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: React with Vite, TypeScript, Tailwind CSS
- **Authentication**: JWT with refresh tokens
- **Payments**: Stripe
- **WhatsApp**: WhatsApp Business Cloud API
- **Deployment**: Railway.app (Backend), Vercel (Frontend)
- **Containerization**: Docker & Docker Compose

### Project Structure

```
AFORSEV-Ecommerce/
├── backend/              # Node.js/Express backend
├── frontend/            # React frontend (to be created)
├── docker-compose.yml   # Local development
└── README.md           # This file
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (optional - Docker provided)
- WhatsApp Business API access (for WhatsApp features)

### 1. Backend Setup

```bash
cd backend

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# Set up database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start development server
npm run dev
```

### 2. Environment Variables

Create `.env` file in `backend/` with:

```env
# Database
DATABASE_URL="postgresql://aforsev:aforsev123@localhost:5432/aforsev_db?schema=public"

# Authentication
JWT_SECRET="your_jwt_secret_key_here_min_32_chars"
JWT_REFRESH_SECRET="your_refresh_secret_key_here_min_32_chars"

# WhatsApp (optional for development)
WHATSAPP_ACCESS_TOKEN="your_token"
WHATSAPP_VERIFY_TOKEN="your_token"
WHATSAPP_PHONE_NUMBER_ID="your_number_id"
WHATSAPP_BUSINESS_ACCOUNT_ID="your_account_id"

# Application
NODE_ENV="development"
PORT="3000"
CORS_ORIGIN="http://localhost:5173"
```

### 3. Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## 📦 API Documentation

### Base URL
- Development: `http://localhost:3000`
- Production: `https://api.aforsev.com`

### Key Endpoints

#### Public Endpoints
- `GET /api/products` - List products with filtering
- `GET /api/products/:id` - Get product details
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Protected Endpoints (User)
- `GET /api/cart` - Get cart contents
- `POST /api/cart` - Add to cart
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders

#### Admin Endpoints
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### WhatsApp Endpoints
- `GET /webhook` - WhatsApp webhook verification
- `POST /webhook` - Receive WhatsApp messages
- `POST /api/whatsapp/share-cart` - Share cart via WhatsApp
- `POST /api/whatsapp/share-product` - Share product via WhatsApp

## 🔧 WhatsApp Integration

### Setup
1. Create Facebook Business Manager account
2. Set up WhatsApp Business API access
3. Configure webhook URL: `https://your-api.com/webhook`
4. Set verification token in `.env`

### Features
- **Cart Sharing**: Users can share their cart via WhatsApp
- **Product Inquiry**: Ask about specific products
- **Order Notifications**: Order status updates
- **Customer Support**: Automated responses and routing

## 🗄️ Database Schema

### Key Models
- **User**: Customer accounts with authentication
- **Product**: Product catalog with categories
- **Cart**: Shopping cart with guest/user support
- **CartItem**: Items in cart with quantity
- **Order**: Customer orders with status tracking
- **OrderItem**: Items in orders

## 🚀 Deployment

### Backend (Railway.app)
1. Create Railway account
2. Connect GitHub repository
3. Add PostgreSQL database plugin
4. Set environment variables
5. Deploy

### Frontend (Vercel)
1. Create Vercel account
2. Import GitHub repository
3. Set environment variables
4. Configure build settings
5. Deploy

### Database Migrations
```bash
# Generate migration
npx prisma migrate dev --name init

# Apply migrations in production
npx prisma migrate deploy
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test specific endpoint
curl http://localhost:3000/api/health
```

## 📈 Monitoring

- **Health Check**: `GET /api/health`
- **Error Tracking**: Winston logging
- **Performance**: Response time monitoring
- **Uptime**: Health check endpoints

## 🔒 Security

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- CORS configuration
- Rate limiting on API endpoints
- Helmet.js security headers
- Input validation with Zod

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

Proprietary - All rights reserved

## 📞 Support

For support, contact:
- Email: support@aforsev.com
- WhatsApp: +1234567890
- GitHub Issues

---

**AFORSEV Tech Shop** - Your trusted technology partner
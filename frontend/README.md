# AFORSEV E-commerce Frontend

React frontend for the AFORSEV E-commerce platform with TypeScript, Tailwind CSS, and Zustand state management.

## Features

- **Modern Stack**: React 18, TypeScript, Vite, Tailwind CSS
- **State Management**: Zustand with persistence
- **Routing**: React Router DOM v6
- **API Integration**: Axios with interceptors for auth
- **UI Components**: Responsive design with Tailwind
- **Cart System**: Guest/user cart with local storage
- **Product Catalog**: Filtering, search, categories

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── store/         # Zustand stores
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── public/            # Static assets
└── package.json       # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file (optional):
   ```bash
   cp .env.example .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open browser at `http://localhost:5173`

### Environment Variables

Create `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=AFORSEV E-commerce
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Integration

The frontend is configured to proxy API requests to the backend server running on `http://localhost:3000`. Update the `VITE_API_URL` in `.env` if your backend runs on a different port.

## Key Components

### ProductCard
Displays product information with add-to-cart functionality.

### Navbar
Responsive navigation bar with cart counter and mobile menu.

### CartStore
Zustand store for managing cart state with local storage persistence.

### API Service
Axios instance with request/response interceptors for authentication.

## Development

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navbar links if needed

### Adding New API Endpoints
1. Create service in `src/services/`
2. Import and use in components

### Styling
- Use Tailwind CSS utility classes
- Custom styles in `src/index.css`
- Component-specific styles with `@apply`

## Deployment

### Build for Production
```bash
npm run build
```

The build output will be in the `dist/` directory, ready to be deployed to any static hosting service (Vercel, Netlify, etc.).

### Docker Deployment
The project includes a Dockerfile for containerized deployment.

## Backend Requirements

Ensure the backend server is running with the following endpoints available:

- `GET /api/products` - Product listing
- `GET /api/products/:id` - Product details
- `POST /api/cart` - Add to cart
- `GET /api/cart` - Get cart
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## License

Proprietary - All rights reserved
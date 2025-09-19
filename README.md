# SpringCode Generator - Front-End

A React frontend application for the SpringCode Generator platform, designed for enterprise users to securely manage projects, collaborate on UML diagrams, and generate SpringBoot code.

## 🚀 Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling and development
- **TailwindCSS v4** for styling
- **shadcn/ui** components library
- **Redux Toolkit** for state management
- **Redux Toolkit Query** for API management
- **JWT Authentication** with 2FA support

## 🏗️ Architecture

### State Management
- **Redux Toolkit** store with separate slices for authentication and UI state
- **RTK Query** for API endpoints with automatic caching and invalidation
- Type-safe hooks for Redux integration

### Authentication Flow
- Corporate email validation with domain checking
- Secure login with JWT tokens
- Two-factor authentication (2FA) support
- Token refresh mechanism
- Secure logout with session management

### UI Components
- Modular component architecture using shadcn/ui
- Responsive design with mobile support
- Professional blue/slate color scheme
- Inter font family for enterprise appearance

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard-specific components
│   ├── registration/      # Multi-step registration components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   └── icons/            # Icon components
├── pages/                # Page components
├── store/               # Redux store configuration
│   ├── api/             # RTK Query API definitions
│   └── slices/          # Redux slices
├── hooks/               # Custom hooks
└── lib/                 # Utility functions
```

## 🎨 UI Features

### Login
- Enterprise login form with corporate email validation
- Password visibility toggle
- Remember device option
- Two-factor authentication with 6-digit code input
- Auto-focus and paste support for 2FA codes
- Professional security indicators

### Dashboard
- Header with logo and navigation
- Auto-save status indicators
- User profile dropdown with session information
- Secure logout confirmation modal
- Revoke all sessions functionality
- Project status display

### Registration
- Multi-step registration workflow
- Progress indicator
- Step 1: Personal information with validation
- Step 2: Professional role and company information
- Step 3: Security setup with email verification and 2FA
- Form validation with real-time feedback

## 🛠️ Development

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm 10.7.0+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### TailwindCSS
Custom configuration with shadcn/ui integration, including:
- Custom color variables
- Inter font family
- Professional blue/slate color scheme
- Custom animations for auto-save indicators

### TypeScript
Strict TypeScript configuration with:
- Path mapping for clean imports (`@/`)
- Type-safe Redux hooks
- Proper API response typing

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly interface elements
- Optimized for enterprise mobile usage

## 🔒 Security Features

- JWT token management with automatic refresh
- Secure logout with token invalidation
- 2FA integration
- Corporate domain validation
- Session management
- HTTPS enforcement (production)

## 🚀 Deployment

The application is ready for deployment with:
- Production build optimization
- Environment variable support
- Static asset handling
- Modern browser compatibility

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

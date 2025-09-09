# Frontend File Tree - Vite + React + TypeScript Structure

```
frontend/
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
├── .env.example
├── .env.local
├── Dockerfile
├── .gitignore
├── README.md
├── index.html
│
├── public/
│   ├── favicon.ico
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json              # PWA manifest
│   ├── robots.txt
│   └── sw.js                      # Service worker
│
├── src/
│   ├── main.tsx                   # App entry point
│   ├── App.tsx                    # Root component
│   ├── index.css                  # Global styles
│   ├── vite-env.d.ts             # Vite type definitions
│   │
│   ├── components/                # Reusable UI components
│   │   ├── ui/                    # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── index.ts           # Export barrel
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   └── Layout.tsx
│   │   │
│   │   ├── auth/                  # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── AuthGuard.tsx
│   │   │
│   │   ├── content/               # Content-related components
│   │   │   ├── LessonCard.tsx
│   │   │   ├── LessonGrid.tsx
│   │   │   ├── LessonCarousel.tsx
│   │   │   ├── QuizComponent.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── ContentFilter.tsx
│   │   │   └── SearchBar.tsx
│   │   │
│   │   ├── challenges/            # Challenge components
│   │   │   ├── ChallengeCard.tsx
│   │   │   ├── ChallengeGrid.tsx
│   │   │   ├── SubmissionForm.tsx
│   │   │   ├── EvidenceUpload.tsx
│   │   │   ├── SubmissionStatus.tsx
│   │   │   └── ChallengeModal.tsx
│   │   │
│   │   ├── gamification/          # Gamification components
│   │   │   ├── PointsDisplay.tsx
│   │   │   ├── BadgeCollection.tsx
│   │   │   ├── BadgeCard.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── AchievementToast.tsx
│   │   │   └── LevelIndicator.tsx
│   │   │
│   │   ├── teacher/               # Teacher-specific components
│   │   │   ├── SubmissionReview.tsx
│   │   │   ├── StudentProgress.tsx
│   │   │   ├── ClassOverview.tsx
│   │   │   └── ApprovalQueue.tsx
│   │   │
│   │   ├── admin/                 # Admin components
│   │   │   ├── UserManagement.tsx
│   │   │   ├── ContentManagement.tsx
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   └── SystemSettings.tsx
│   │   │
│   │   └── common/                # Common utility components
│   │       ├── ErrorBoundary.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── InfiniteScroll.tsx
│   │       ├── ImageOptimized.tsx
│   │       ├── LazyLoad.tsx
│   │       └── SEOHead.tsx
│   │
│   ├── pages/                     # Page components
│   │   ├── Home.tsx               # Landing/dashboard page
│   │   ├── Login.tsx              # Login page
│   │   ├── Register.tsx           # Registration page
│   │   ├── Profile.tsx            # User profile
│   │   ├── Lessons.tsx            # Lessons listing
│   │   ├── LessonDetail.tsx       # Individual lesson
│   │   ├── Quiz.tsx               # Quiz interface
│   │   ├── Challenges.tsx         # Challenges listing
│   │   ├── ChallengeDetail.tsx    # Individual challenge
│   │   ├── Leaderboard.tsx        # Leaderboard page
│   │   ├── Badges.tsx             # Badge collection
│   │   ├── TeacherDashboard.tsx   # Teacher dashboard
│   │   ├── AdminDashboard.tsx     # Admin dashboard
│   │   ├── Settings.tsx           # User settings
│   │   ├── About.tsx              # About page
│   │   ├── NotFound.tsx           # 404 page
│   │   └── Offline.tsx            # PWA offline page
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts             # Authentication hook
│   │   ├── useApi.ts              # API interaction hook
│   │   ├── useLocalStorage.ts     # Local storage hook
│   │   ├── useDebounce.ts         # Debounce hook
│   │   ├── useInfiniteScroll.ts   # Infinite scroll hook
│   │   ├── useImageUpload.ts      # Image upload hook
│   │   ├── useNotifications.ts    # Toast notifications hook
│   │   ├── usePWA.ts              # PWA functionality hook
│   │   └── useTheme.ts            # Theme management hook
│   │
│   ├── context/                   # React Context providers
│   │   ├── AuthContext.tsx        # Authentication context
│   │   ├── ThemeContext.tsx       # Theme context
│   │   ├── NotificationContext.tsx # Notification context
│   │   └── PWAContext.tsx         # PWA context
│   │
│   ├── store/                     # State management (Zustand)
│   │   ├── authStore.ts           # Auth state
│   │   ├── uiStore.ts             # UI state (modals, etc.)
│   │   ├── notificationStore.ts   # Notifications state
│   │   └── index.ts               # Store exports
│   │
│   ├── services/                  # API services
│   │   ├── api.ts                 # Axios configuration
│   │   ├── auth.ts                # Auth API calls
│   │   ├── users.ts               # User API calls
│   │   ├── content.ts             # Content API calls
│   │   ├── challenges.ts          # Challenge API calls
│   │   ├── gamification.ts        # Gamification API calls
│   │   ├── upload.ts              # File upload service
│   │   └── websocket.ts           # WebSocket service
│   │
│   ├── utils/                     # Utility functions
│   │   ├── constants.ts           # App constants
│   │   ├── helpers.ts             # General helpers
│   │   ├── formatters.ts          # Data formatters
│   │   ├── validators.ts          # Form validators
│   │   ├── storage.ts             # Storage utilities
│   │   ├── animations.ts          # Framer Motion variants
│   │   ├── seo.ts                 # SEO utilities
│   │   └── pwa.ts                 # PWA utilities
│   │
│   ├── types/                     # TypeScript type definitions
│   │   ├── auth.ts                # Auth types
│   │   ├── user.ts                # User types
│   │   ├── content.ts             # Content types
│   │   ├── challenge.ts           # Challenge types
│   │   ├── gamification.ts        # Gamification types
│   │   ├── api.ts                 # API response types
│   │   └── common.ts              # Common types
│   │
│   ├── styles/                    # Styling files
│   │   ├── globals.css            # Global CSS
│   │   ├── components.css         # Component-specific styles
│   │   ├── animations.css         # CSS animations
│   │   └── themes.css             # Theme variables
│   │
│   ├── assets/                    # Static assets
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   ├── hero-bg.jpg
│   │   │   ├── placeholder.svg
│   │   │   └── icons/
│   │   │       ├── badge-icons/
│   │   │       └── ui-icons/
│   │   ├── videos/
│   │   │   └── intro.mp4
│   │   └── fonts/
│   │       └── custom-fonts.woff2
│   │
│   └── __tests__/                 # Test files
│       ├── components/
│       │   ├── ui/
│       │   ├── auth/
│       │   └── content/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       ├── utils/
│       ├── setup.ts               # Test setup
│       └── mocks/
│           ├── handlers.ts        # MSW handlers
│           └── server.ts          # MSW server
│
├── .github/                       # GitHub workflows
│   └── workflows/
│       ├── ci.yml                 # CI pipeline
│       ├── deploy.yml             # Deployment
│       └── lighthouse.yml         # Performance testing
│
└── docs/                          # Documentation
    ├── DEPLOYMENT.md              # Deployment guide
    ├── CONTRIBUTING.md            # Contribution guide
    └── COMPONENTS.md              # Component documentation
```

## Key Configuration Files

### package.json
```json
{
  "name": "enviro-edu-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "type-check": "tsc --noEmit",
    "analyze": "npx vite-bundle-analyzer"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "@tanstack/react-query": "^5.8.4",
    "zustand": "^4.4.6",
    "axios": "^1.6.0",
    "framer-motion": "^10.16.4",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.292.0",
    "react-hot-toast": "^2.4.1",
    "react-intersection-observer": "^9.5.2",
    "workbox-window": "^7.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.1.1",
    "@vitest/ui": "^0.34.6",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "jsdom": "^22.1.0",
    "msw": "^2.0.8",
    "postcss": "^8.4.31",
    "prettier": "^3.0.3",
    "prettier-plugin-tailwindcss": "^0.5.7",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^4.5.0",
    "vite-plugin-pwa": "^0.17.0",
    "vitest": "^0.34.6",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/user-event": "^14.5.1"
  }
}
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      manifest: {
        name: 'Environmental Education Platform',
        short_name: 'EcoEdu',
        description: 'Gamified environmental education platform',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/assets': path.resolve(__dirname, './src/assets')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts']
  }
})
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b'
        },
        secondary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ]
}
```

### .env.example
```
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_BASE_URL=ws://localhost:8000/ws

# App Configuration
VITE_APP_NAME="Environmental Education Platform"
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_WEBSOCKETS=true

# External Services
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Development
VITE_MOCK_API=false
VITE_DEBUG_MODE=true
```

### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

This frontend structure provides a comprehensive foundation for the Netflix-style environmental education platform with modern React patterns, TypeScript safety, and production-ready tooling.
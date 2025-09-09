import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Achievements from '@/pages/Achievements';
import LessonDetail from '@/pages/LessonDetail';
import ChallengeSubmit from '@/pages/ChallengeSubmit';
import Leaderboard from '@/pages/Leaderboard';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import Contact from '@/pages/Contact';
import Courses from '@/pages/Courses';
import About from '@/pages/About';
import LearningPaths from '@/pages/LearningPaths';
import Challenges from '@/pages/Challenges';
import Resources from '@/pages/Resources';
import LoadingSpinner from '@/components/LoadingSpinner';

// No authentication guards - all routes are accessible

// Main App Layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// App Routes Component
const AppRoutes: React.FC = () => {
  return (
    <AppLayout>
      <Routes>
        {/* All routes are now accessible without authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lesson/:id" element={<LessonDetail />} />
        <Route path="/challenge/:id" element={<ChallengeSubmit />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/courses" element={<Courses />} />
          <Route path="/about" element={<About />} />
          <Route path="/learning-paths" element={<LearningPaths />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/resources" element={<Resources />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
};

export default App;
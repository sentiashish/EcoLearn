import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
  HomeIcon,
  TrophyIcon,
  GlobeAltIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  CogIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
    { name: 'Learning Paths', href: '/learning-paths', icon: AcademicCapIcon },
    { name: 'Challenges', href: '/challenges', icon: GlobeAltIcon },
    { name: 'Resources', href: '/resources', icon: BookOpenIcon },
    { name: 'Achievements', href: '/achievements', icon: StarIcon },

  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-20">
          {/* Logo and primary navigation */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="relative">
                  <GlobeAltIcon className="h-10 w-10 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-200" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <div className="ml-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    EcoLearn
                  </span>
                  <div className="text-xs text-gray-500 font-medium tracking-wide">
                    Environmental Education Platform
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden lg:ml-12 lg:flex lg:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActivePath(item.href)
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50/50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - User menu or login */}
          <div className="hidden lg:ml-16 sm:ml-10 sm:flex sm:items-center sm:space-x-4">

            {user ? (
              <>
                {/* Notification Bell */}
                <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors duration-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 2.485 14.41a.75.75 0 0 0-.157.832L3.938 18.5H8.5v-2.647l4.97-4.97a.75.75 0 0 0 0-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0z" />
                  </svg>
                </button>
                
                <Menu as="div" className="relative">
                  <div>
                    <Menu.Button className="flex items-center text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 bg-white border border-gray-200 hover:border-emerald-300 transition-all duration-200 px-3 py-2">
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                      </div>
                      <div className="ml-3 text-left hidden md:block">
                        <div className="text-sm font-semibold text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </div>
                      <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-400" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-3 w-64 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-white font-bold">
                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-600">{user.email}</p>
                            <div className="flex items-center mt-1">
                              <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                              <span className="text-xs text-green-600 font-medium">Active</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`${
                                active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                              } flex items-center px-4 py-3 text-sm font-medium transition-colors duration-150`}
                            >
                              <UserIcon className="h-5 w-5 mr-3" />
                              My Profile
                            </Link>
                          )}
                        </Menu.Item>
                        
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/settings"
                              className={`${
                                active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                              } flex items-center px-4 py-3 text-sm font-medium transition-colors duration-150`}
                            >
                              <CogIcon className="h-5 w-5 mr-3" />
                              Settings
                            </Link>
                          )}
                        </Menu.Item>
                        
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/help"
                              className={`${
                                active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                              } flex items-center px-4 py-3 text-sm font-medium transition-colors duration-150`}
                            >
                              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Help & Support
                            </Link>
                          )}
                        </Menu.Item>
                      </div>
                      
                      <div className="border-t border-gray-100 py-2">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`${
                                active ? 'bg-red-50 text-red-700' : 'text-gray-700'
                              } flex items-center w-full text-left px-4 py-3 text-sm font-medium transition-colors duration-150`}
                            >
                              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
              </Menu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-emerald-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Transition
        show={mobileMenuOpen}
        as={Fragment}
        enter="duration-200 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="pt-4 pb-3 space-y-2 px-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActivePath(item.href)
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          {user ? (
            <div className="pt-4 pb-4 border-t border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50 mx-4 rounded-lg">
              <div className="flex items-center px-4 py-3">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-white font-bold shadow-sm">
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-base font-semibold text-gray-900">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.email}
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-2 px-4">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-emerald-700 hover:bg-white transition-colors duration-200"
                >
                  <UserIcon className="h-5 w-5 mr-3" />
                  My Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-emerald-700 hover:bg-white transition-colors duration-200"
                >
                  <CogIcon className="h-5 w-5 mr-3" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:text-red-700 hover:bg-white transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-4 border-t border-gray-100 mx-4">
              <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-base font-semibold text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-base font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white text-center shadow-lg transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </Transition>
    </nav>
  );
};

export default NavBar;
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-[#0078D4]' : 'text-white';
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/use-cases', label: 'Use Cases' },
    { path: '/work-with-us', label: 'Work With Us' },
  ];

  return (
    <nav className="bg-[#00204E] border-b border-[#003175]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className='flex hover:cursor-pointer' onClick={() => navigate('/')}>
              <svg width="24" height="24" viewBox="0 0 24 24" className="mr-2">
                <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
              </svg>
              <span className="text-xl font-semibold text-white">GRC Platform</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`hover:text-[#0078D4] px-3 py-2 text-sm font-medium transition-colors duration-200 ${isActive(link.path)}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="text-white hover:text-[#0078D4] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-[#0078D4] text-white hover:bg-[#106EBE] px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-[#0078D4] focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-[#003175]`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-base font-medium ${
                isActive(link.path)
              } hover:text-[#0078D4] transition-colors duration-200`}
            >
              {link.label}
            </button>
          ))}
          <div className="border-t border-[#003175] pt-4 pb-3">
            <button
              onClick={() => {
                navigate('/login');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-white hover:text-[#0078D4] transition-colors duration-200"
            >
              Login
            </button>
            <button
              onClick={() => {
                navigate('/signup');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-[#0078D4] hover:text-[#106EBE] transition-colors duration-200"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
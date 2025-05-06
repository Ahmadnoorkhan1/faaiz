import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#001538] border-t border-[#003175]">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">GRC Platform</h3>
            <p className="text-white/70 text-sm">
              Empowering organizations with comprehensive Governance, Risk, and Compliance solutions.
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/70 hover:text-white text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/onboard/client" className="text-white/70 hover:text-white text-sm">
                  Client Onboarding
                </Link>
              </li>
              <li>
                <Link to="/onboard/consultant" className="text-white/70 hover:text-white text-sm">
                  Consultant Onboarding
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-white/70 text-sm">Email: support@grcplatform.com</li>
              <li className="text-white/70 text-sm">Phone: +1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[#003175]">
          <p className="text-white/50 text-sm text-center">
            © {new Date().getFullYear()} GRC Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
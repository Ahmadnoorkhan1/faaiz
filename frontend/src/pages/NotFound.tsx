import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <div className="flex justify-center">
          <div className="h-24 w-24 text-primary-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-900">Page not found</h1>
        <p className="mt-4 text-lg text-neutral-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Link 
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary-500 px-6 py-3 text-base font-medium text-white hover:bg-primary-600"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 
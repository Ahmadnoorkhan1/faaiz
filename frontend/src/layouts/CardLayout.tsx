import React from 'react';

interface CardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const CardLayout: React.FC<CardLayoutProps> = ({ children, title }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-6 md:p-8">
        {title && (
          <h1 className="text-2xl font-semibold text-neutral-900 mb-6">
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  );
};

export default CardLayout; 
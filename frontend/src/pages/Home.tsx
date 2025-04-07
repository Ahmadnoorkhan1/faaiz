import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero section */}
      <div className="relative overflow-hidden bg-primary-500 text-white">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute w-[200%] h-[200%] rounded-full border border-white/10 top-[10%] left-[-50%]"></div>
          <div className="absolute w-[150%] h-[150%] rounded-full border border-white/20 top-[20%] left-[-25%]"></div>
          <div className="absolute w-[100%] h-[100%] rounded-full border border-white/30 top-[30%] left-[0%]"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold">GRC Solutions</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="rounded-md bg-white px-4 py-2 text-sm font-medium text-primary-500 shadow-sm hover:bg-neutral-100"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-white hover:text-neutral-200 text-sm font-medium"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/register" 
                    className="rounded-md bg-white px-4 py-2 text-sm font-medium text-primary-500 shadow-sm hover:bg-neutral-100"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8 lg:pt-24 lg:pb-32">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Streamlined Governance, Risk & Compliance
              </h1>
              <p className="mt-6 max-w-3xl text-xl">
                Our platform helps organizations efficiently manage governance, risk, and compliance with powerful tools designed to streamline your operations.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="rounded-md bg-white px-6 py-3 text-base font-medium text-primary-500 shadow-sm hover:bg-neutral-100"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="rounded-md bg-white px-6 py-3 text-base font-medium text-primary-500 shadow-sm hover:bg-neutral-100"
                  >
                    Get started
                  </Link>
                )}
                <a
                  href="#features"
                  className="text-base font-medium text-white hover:text-neutral-200"
                >
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              {/* Hero image placeholder */}
              <div className="relative h-64 rounded-lg bg-white/10 backdrop-blur-sm sm:h-72 md:h-96">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-24 w-24 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                    <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Comprehensive GRC Solutions
            </h2>
            <p className="mt-6 text-lg leading-8 text-neutral-600">
              Our platform provides end-to-end solutions for all your governance, risk, and compliance needs.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-neutral-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Streamlined Compliance
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600">
                  <p className="flex-auto">
                    Simplify regulatory compliance with automated workflows and comprehensive reporting tools designed for efficiency.
                  </p>
                </dd>
              </div>

              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-neutral-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  Enhanced Risk Management
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600">
                  <p className="flex-auto">
                    Identify, assess, and mitigate risks with our advanced analytics and real-time monitoring systems.
                  </p>
                </dd>
              </div>

              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-neutral-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  Collaborative Governance
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600">
                  <p className="flex-auto">
                    Foster transparency and accountability with our collaborative tools that keep all stakeholders aligned.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-primary-500">
        <div className="mx-auto max-w-7xl py-12 px-6 sm:py-16 lg:px-8 lg:py-20">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to transform your GRC processes?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join organizations that have streamlined their compliance, reduced risks, and improved governance with our platform.
          </p>
          <div className="mt-8 flex">
            <Link
              to="/register"
              className="inline-block rounded-md bg-white px-4 py-2.5 text-base font-semibold text-primary-600 shadow-sm hover:bg-neutral-100"
            >
              Get started today
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-neutral-400">
              &copy; {new Date().getFullYear()} GRC Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 
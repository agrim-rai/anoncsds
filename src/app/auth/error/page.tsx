'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'Your email is not authorized to access this voting system.',
          details: 'Please ensure your email ends with @nsut.ac.in and is in the approved list.'
        };
      case 'Signin':
        return {
          title: 'Sign In Error',
          message: 'There was an error during the sign-in process.',
          details: 'Please try again or contact support if the issue persists.'
        };
      default:
        return {
          title: 'Authentication Error',
          message: 'An unexpected error occurred.',
          details: 'Please try signing in again.'
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            {errorInfo.title}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {errorInfo.message}
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">What went wrong?</h3>
            <p className="text-sm text-gray-300">
              {errorInfo.details}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Requirements for Access</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Email must end with @nsut.ac.in</li>
              <li>• Email must be in the approved student list</li>
              <li>• Valid Google account required</li>
            </ul>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/auth/signin')}
              className="flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-3 px-4 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
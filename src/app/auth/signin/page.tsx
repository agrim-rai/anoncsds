'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push('/');
      }
    });
  }, [router]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            NSUT Voting System
          </h2>
          <p className="text-xl text-gray-400 font-medium">
            Sign in with your NSUT email to participate in voting
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {/* Requirements Card */}
          <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 backdrop-blur-sm border border-blue-700/50 rounded-2xl p-8 card-hover">
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-4">Authentication Requirements</h3>
                <ul className="text-gray-300 space-y-3">
                  <li className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                    <span>Email must end with @nsut.ac.in</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                    <span>Email must be in the approved list</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                    <span>One vote per student</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Sign In Button */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-8 card-hover">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 transform hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center space-x-3">
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Sign in with Google</span>
                </span>
              )}
            </button>
          </div>
          
          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500 leading-relaxed">
              By signing in, you agree to participate in the NSUT student voting process.<br/>
              Your vote will be kept confidential and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Candidate {
  _id: string;
  name: string;
  position: string;
  description?: string;
  voteCount: number;
}

interface VotingGroup {
  group: string;
  description: string;
  candidates: Candidate[];
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<VotingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user) {
      setHasVoted((session.user as any).hasVoted || false);
      fetchCandidates();
    }
  }, [status, session, router]);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      alert('Please select a candidate to vote for');
      return;
    }

    setVoting(true);
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidateId: selectedCandidate }),
      });

      if (response.ok) {
        alert('Vote cast successfully!');
        setHasVoted(true);
        router.push('/results');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cast vote');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      alert('Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-300 animate-pulse">Loading voting system...</div>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">NSUT Voting System</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 hidden sm:block">Welcome, {session?.user?.name}</span>
                <button
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Success Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-sm border border-green-700/50 rounded-2xl p-12 card-hover">
              <div className="flex items-center justify-center mb-6">
                <div className="h-20 w-20 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-green-400 mb-4">Vote Submitted Successfully!</h2>
              <p className="text-green-200 mb-8 text-lg leading-relaxed">
                Thank you for participating in the NSUT student elections. Your vote has been recorded securely and will remain confidential.
              </p>
                              <button
                  onClick={() => router.push('/results')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 text-lg rounded-xl hover:scale-105 transform transition-all duration-200"
                >
                  View Live Results
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">NSUT Voting System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/results')}
                className="text-blue-400 hover:text-blue-300 transition-colors px-3 py-2 rounded-lg hover:bg-gray-700/50"
              >
                View Results
              </button>
              <span className="text-gray-300 hidden sm:block">Welcome, {session?.user?.name}</span>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Instructions Card */}
          <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 backdrop-blur-sm border border-blue-700/50 rounded-2xl p-8 mb-8 card-hover">
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4">Voting Instructions</h2>
                <ul className="text-gray-300 space-y-3 text-lg">
                  <li className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                    <span>Select one candidate from any available category</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                    <span>You can only vote once across all categories</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                    <span>Once submitted, your vote cannot be changed</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                    <span>Results will be available immediately after voting</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Voting Groups */}
          <div className="space-y-8">
            {groups.map((group, groupIndex) => (
              <div 
                key={group.group} 
                className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-8 card-hover"
                style={{ animationDelay: `${groupIndex * 0.1}s` }}
              >
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-white mb-2">{group.group}</h3>
                  <p className="text-gray-400 text-lg">{group.description}</p>
                </div>
                
                <div className="grid gap-4">
                  {group.candidates.map((candidate, candidateIndex) => (
                    <label
                      key={candidate._id}
                      className={`flex items-start p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedCandidate === candidate._id
                          ? 'border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-500/20'
                          : 'border-gray-600/50 hover:border-blue-400/50 hover:bg-gray-700/30'
                      } card-hover`}
                      style={{ animationDelay: `${(groupIndex * 0.1) + (candidateIndex * 0.05)}s` }}
                    >
                      <input
                        type="radio"
                        name="candidate"
                        value={candidate._id}
                        checked={selectedCandidate === candidate._id}
                        onChange={(e) => setSelectedCandidate(e.target.value)}
                        className="mt-2 h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-2 border-gray-300"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-xl font-bold text-white">{candidate.name}</div>
                          {selectedCandidate === candidate._id && (
                            <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="text-blue-400 font-medium mb-2">{candidate.position}</div>
                        {candidate.description && (
                          <div className="text-gray-300 leading-relaxed">{candidate.description}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          {selectedCandidate && (
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 backdrop-blur-sm border border-green-700/50 rounded-2xl p-8 card-hover">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Submit Your Vote?</h3>
                <p className="text-gray-300 mb-6">
                  Once you submit, your vote cannot be changed. Please confirm your selection.
                </p>
                <button
                  onClick={handleVote}
                  disabled={voting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 transform hover:shadow-lg text-lg"
                >
                  {voting ? (
                    <span className="flex items-center space-x-3">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting Vote...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-3">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Submit Vote</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

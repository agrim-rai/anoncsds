'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ResultCandidate {
  id: string;
  name: string;
  position: string;
  description?: string;
  voteCount: number;
}

interface ResultGroup {
  group: string;
  description: string;
  candidates: ResultCandidate[];
}

interface ResultsData {
  results: ResultGroup[];
  totalVotes: number;
  timestamp: string;
}

export default function Results() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    fetchResults();
  }, [status, router]);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results');
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setLastUpdated(new Date().toLocaleString());
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVotePercentage = (voteCount: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return ((voteCount / totalVotes) * 100).toFixed(1);
  };

  const getWinner = (candidates: ResultCandidate[]) => {
    if (candidates.length === 0) return null;
    return candidates.reduce((prev, current) => 
      prev.voteCount > current.voteCount ? prev : current
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-300 animate-pulse">Loading results...</div>
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
              <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Election Results</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-blue-400 hover:text-blue-300 transition-colors px-3 py-2 rounded-lg hover:bg-gray-700/50"
              >
                Back to Voting
              </button>
              <button
                onClick={fetchResults}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg hover:scale-105 transform transition-all duration-200"
              >
                <svg className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {results && (
          <div className="max-w-6xl mx-auto">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-sm border border-blue-700/50 rounded-2xl p-6 card-hover">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-400">{results.totalVotes}</div>
                    <div className="text-gray-400 font-medium">Total Votes Cast</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-sm border border-green-700/50 rounded-2xl p-6 card-hover">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400">{results.results.length}</div>
                    <div className="text-gray-400 font-medium">Active Categories</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-6 card-hover">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-400">Live Updates</div>
                    <div className="text-gray-400 font-medium text-sm">{lastUpdated}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results by Category */}
            <div className="space-y-8">
              {results.results.map((group, groupIndex) => {
                const winner = getWinner(group.candidates);
                const groupTotalVotes = group.candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
                
                return (
                  <div 
                    key={group.group} 
                    className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-8 card-hover"
                    style={{ animationDelay: `${groupIndex * 0.1}s` }}
                  >
                    {/* Category Header */}
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-2">{group.group}</h3>
                        <p className="text-gray-400 text-lg">{group.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{groupTotalVotes}</div>
                        <div className="text-gray-400 font-medium">Total Votes</div>
                      </div>
                    </div>

                    {/* Winner Banner */}
                    {winner && groupTotalVotes > 0 && (
                      <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 backdrop-blur-sm border border-yellow-700/50 rounded-xl p-6 mb-8">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-yellow-400 font-bold text-lg">🏆 Current Leader</div>
                            <div className="text-white font-semibold text-xl">{winner.name}</div>
                            <div className="text-yellow-300">
                              {winner.voteCount} votes ({getVotePercentage(winner.voteCount, groupTotalVotes)}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Candidates List */}
                    <div className="space-y-4">
                      {group.candidates
                        .sort((a, b) => b.voteCount - a.voteCount)
                        .map((candidate, index) => (
                        <div 
                          key={candidate.id} 
                          className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 backdrop-blur-sm border border-gray-500/50 rounded-xl p-6 hover:border-gray-400/50 transition-all duration-300"
                          style={{ animationDelay: `${(groupIndex * 0.1) + (index * 0.05)}s` }}
                        >
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-4">
                              {/* Position Badge */}
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                index === 0 && groupTotalVotes > 0 
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black' 
                                  : index === 1 && groupTotalVotes > 0
                                  ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-black'
                                  : index === 2 && groupTotalVotes > 0
                                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                                  : 'bg-gray-600 text-white'
                              }`}>
                                #{index + 1}
                              </div>
                              
                              {/* Candidate Info */}
                              <div>
                                <div className="text-xl font-bold text-white">{candidate.name}</div>
                                <div className="text-blue-400 font-medium">{candidate.position}</div>
                              </div>
                            </div>
                            
                            {/* Vote Count */}
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">{candidate.voteCount}</div>
                              <div className="text-gray-400 font-medium">
                                {getVotePercentage(candidate.voteCount, groupTotalVotes)}%
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-600 rounded-full h-3 mb-4 overflow-hidden">
                            <div 
                              className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                                index === 0 && groupTotalVotes > 0 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                              }`}
                              style={{ 
                                width: `${getVotePercentage(candidate.voteCount, groupTotalVotes)}%`,
                                animationDelay: `${(groupIndex * 0.2) + (index * 0.1)}s`
                              }}
                            ></div>
                          </div>
                          
                          {/* Description */}
                          {candidate.description && (
                            <div className="text-gray-300 leading-relaxed">{candidate.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Info */}
            <div className="text-center mt-12">
              <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-sm border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center justify-center space-x-2 text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">
                    Results are updated in real-time. Click refresh to see the latest vote counts.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface LiveCandidate {
  id: string;
  name: string;
  position: string;
  description?: string;
  voteCount: number;
  votePercentage: number;
  recentVotes: number; // votes in last 30 seconds
}

interface LiveGroup {
  group: string;
  description: string;
  candidates: LiveCandidate[];
  totalVotes: number;
  winner?: LiveCandidate;
}

interface LiveStats {
  totalVotes: number;
  totalVoters: number;
  activeCategories: number;
  lastVoteTime?: string;
  votingRate: number; // votes per minute
}

interface LiveData {
  groups: LiveGroup[];
  stats: LiveStats;
  timestamp: string;
}

export default function LiveResults() {
  const { status } = useSession();
  const router = useRouter();
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds

  const fetchLiveData = useCallback(async () => {
    try {
      setIsConnected(true);
      const response = await fetch('/api/live');
      if (response.ok) {
        const data = await response.json();
        setLiveData(data);
        setLastUpdate(new Date());
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const setupAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchLiveData();
      }, refreshInterval * 1000);
    }
  }, [autoRefresh, refreshInterval, fetchLiveData]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    fetchLiveData();
    setupAutoRefresh();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, router, fetchLiveData, setupAutoRefresh]);

  const getStatusColor = () => {
    if (!isConnected) return 'text-red-400';
    const timeSinceUpdate = Date.now() - lastUpdate.getTime();
    if (timeSinceUpdate < 10000) return 'text-green-400';
    if (timeSinceUpdate < 30000) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    const timeSinceUpdate = Date.now() - lastUpdate.getTime();
    if (timeSinceUpdate < 10000) return 'Live';
    if (timeSinceUpdate < 30000) return 'Recent';
    return 'Delayed';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-300 animate-pulse">Loading live results...</div>
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
              <div className="h-10 w-10 bg-red-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Live Vote Counting</h1>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-700/50 ${getStatusColor()}`}>
                <div className="h-2 w-2 rounded-full bg-current animate-pulse"></div>
                <span className="text-sm font-medium">{getStatusText()}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Auto-refresh controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    autoRefresh 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {autoRefresh ? 'Auto ON' : 'Auto OFF'}
                </button>
                
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="bg-gray-700 text-white text-sm rounded-lg px-2 py-1 border border-gray-600"
                >
                  <option value={1}>1s</option>
                  <option value={3}>3s</option>
                  <option value={5}>5s</option>
                  <option value={10}>10s</option>
                  <option value={30}>30s</option>
                </select>
              </div>

              <button
                onClick={() => router.push('/')}
                className="text-blue-400 hover:text-blue-300 transition-colors px-3 py-2 rounded-lg hover:bg-gray-700/50"
              >
                Back to Voting
              </button>
              
              <button
                onClick={fetchLiveData}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg hover:scale-105 transform transition-all duration-200"
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
        {liveData && (
          <div className="max-w-7xl mx-auto">
            {/* Live Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-red-900/50 to-pink-900/50 backdrop-blur-sm border border-red-700/50 rounded-2xl p-6 card-hover">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-red-600 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-400">{liveData.stats.totalVotes}</div>
                    <div className="text-gray-400 font-medium">Total Votes</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-sm border border-blue-700/50 rounded-2xl p-6 card-hover">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-400">{liveData.stats.totalVoters}</div>
                    <div className="text-gray-400 font-medium">Voters</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-sm border border-green-700/50 rounded-2xl p-6 card-hover">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400">{liveData.stats.votingRate.toFixed(1)}</div>
                    <div className="text-gray-400 font-medium">Votes/Min</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-900/50 to-violet-900/50 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-6 card-hover">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-400">
                      {liveData.stats.lastVoteTime ? new Date(liveData.stats.lastVoteTime).toLocaleTimeString() : 'N/A'}
                    </div>
                    <div className="text-gray-400 font-medium">Last Vote</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Results by Category */}
            <div className="space-y-8">
              {liveData.groups.map((group, groupIndex) => (
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
                      <div className="text-2xl font-bold text-white">{group.totalVotes}</div>
                      <div className="text-gray-400 font-medium">Category Votes</div>
                    </div>
                  </div>

                  {/* Winner Banner */}
                  {group.winner && group.totalVotes > 0 && (
                    <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 backdrop-blur-sm border border-yellow-700/50 rounded-xl p-6 mb-8">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                          <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-yellow-400 font-bold text-lg flex items-center">
                            🏆 LIVE LEADER
                            <span className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded-full animate-pulse">
                              LIVE
                            </span>
                          </div>
                          <div className="text-white font-semibold text-xl">{group.winner.name}</div>
                          <div className="text-yellow-300">
                            {group.winner.voteCount} votes ({group.winner.votePercentage.toFixed(1)}%)
                            {group.winner.recentVotes > 0 && (
                              <span className="ml-2 text-green-400 text-sm">
                                +{group.winner.recentVotes} recent
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Live Candidates List */}
                  <div className="space-y-4">
                    {group.candidates
                      .sort((a, b) => b.voteCount - a.voteCount)
                      .map((candidate, index) => (
                      <div 
                        key={candidate.id} 
                        className={`bg-gradient-to-r from-gray-700/50 to-gray-600/50 backdrop-blur-sm border rounded-xl p-6 transition-all duration-500 ${
                          candidate.recentVotes > 0 
                            ? 'border-green-500/50 shadow-lg shadow-green-500/20' 
                            : 'border-gray-500/50'
                        }`}
                        style={{ animationDelay: `${(groupIndex * 0.1) + (index * 0.05)}s` }}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center space-x-4">
                            {/* Position Badge */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg relative ${
                              index === 0 && group.totalVotes > 0 
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black' 
                                : index === 1 && group.totalVotes > 0
                                ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-black'
                                : index === 2 && group.totalVotes > 0
                                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                                : 'bg-gray-600 text-white'
                            }`}>
                              #{index + 1}
                              {candidate.recentVotes > 0 && (
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center animate-bounce">
                                  +{candidate.recentVotes}
                                </div>
                              )}
                            </div>
                            
                            {/* Candidate Info */}
                            <div>
                              <div className="text-xl font-bold text-white flex items-center">
                                {candidate.name}
                                {candidate.recentVotes > 0 && (
                                  <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full animate-pulse">
                                    GAINING
                                  </span>
                                )}
                              </div>
                              <div className="text-blue-400 font-medium">{candidate.position}</div>
                            </div>
                          </div>
                          
                          {/* Vote Count */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{candidate.voteCount}</div>
                            <div className="text-gray-400 font-medium">
                              {candidate.votePercentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Live Progress Bar */}
                        <div className="w-full bg-gray-600 rounded-full h-3 mb-4 overflow-hidden">
                          <div 
                            className={`h-3 rounded-full transition-all duration-1000 ease-out relative ${
                              index === 0 && group.totalVotes > 0 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            }`}
                            style={{ width: `${candidate.votePercentage}%` }}
                          >
                            {candidate.recentVotes > 0 && (
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            )}
                          </div>
                        </div>
                        
                        {/* Description */}
                        {candidate.description && (
                          <div className="text-gray-300 leading-relaxed">{candidate.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Info */}
            <div className="text-center mt-12">
              <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-sm border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center justify-center space-x-2 text-gray-400 mb-2">
                  <svg className="h-5 w-5 animate-pulse text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="font-medium">
                    Live Vote Counting - Updates every {refreshInterval} seconds
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {lastUpdate.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
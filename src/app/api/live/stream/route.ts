import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import VotingGroup from '@/models/VotingGroup';
import User from '@/models/User';

// This endpoint provides Server-Sent Events for real-time updates
export async function GET(req: NextRequest) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Set up SSE headers
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  };

  // Function to send SSE message
  const sendSSE = async (data: unknown, event = 'message') => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(message));
  };

  // Function to get live data
  const getLiveData = async () => {
    try {
      await connectDB();
      
      const groups = await VotingGroup.find({ isActive: true });
      const candidates = await Candidate.find().sort({ voteCount: -1 });
      const totalVoters = await User.countDocuments({ hasVoted: true });
      const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
      
      // Simulate live activity
      const now = new Date();
      const votingRate = totalVotes > 0 ? Math.random() * 10 + 2 : 0;
      const lastVoteTime = totalVotes > 0 ? new Date(now.getTime() - Math.random() * 300000).toISOString() : undefined;
      
      const liveGroups = groups.map(group => {
        const groupCandidates = candidates.filter(candidate => candidate.group === group.name);
        const groupTotalVotes = groupCandidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
        
        const liveCandidates = groupCandidates.map(candidate => {
          const recentVotes = candidate.voteCount > 0 ? Math.floor(Math.random() * Math.min(3, Math.max(1, candidate.voteCount * 0.1))) : 0;
          const votePercentage = groupTotalVotes > 0 ? (candidate.voteCount / groupTotalVotes) * 100 : 0;
          
          return {
            id: candidate._id.toString(),
            name: candidate.name,
            position: candidate.position,
            description: candidate.description,
            voteCount: candidate.voteCount,
            votePercentage,
            recentVotes,
          };
        });
        
        const sortedCandidates = [...liveCandidates].sort((a, b) => b.voteCount - a.voteCount);
        const winner = sortedCandidates[0]?.voteCount > 0 ? sortedCandidates[0] : undefined;
        
        return {
          group: group.name,
          description: group.description,
          candidates: liveCandidates,
          totalVotes: groupTotalVotes,
          winner,
        };
      });
      
      return {
        groups: liveGroups,
        stats: {
          totalVotes,
          totalVoters,
          activeCategories: groups.length,
          lastVoteTime,
          votingRate: Math.round(votingRate * 10) / 10,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting live data:', error);
      throw error;
    }
  };

  // Start the SSE stream
  const startStream = async () => {
    try {
      // Send initial connection message
      await sendSSE({ type: 'connected', message: 'Live stream connected' }, 'connection');
      
      // Send live data every 3 seconds
      const interval = setInterval(async () => {
        try {
          const liveData = await getLiveData();
          await sendSSE(liveData, 'live-update');
        } catch (error) {
          console.error('Error sending live update:', error);
          await sendSSE({ type: 'error', message: 'Failed to fetch live data' }, 'error');
        }
      }, 3000);

      // Handle client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        writer.close();
      });

    } catch (error) {
      console.error('Error starting SSE stream:', error);
      await sendSSE({ type: 'error', message: 'Failed to start live stream' }, 'error');
      writer.close();
    }
  };

  // Start the stream
  startStream();

  return new Response(responseStream.readable, { headers });
} 
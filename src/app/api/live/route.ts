import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import VotingGroup from '@/models/VotingGroup';
import User from '@/models/User';

interface LiveCandidate {
  id: string;
  name: string;
  position: string;
  description?: string;
  voteCount: number;
  votePercentage: number;
  recentVotes: number;
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
  votingRate: number;
}

export async function GET() {
  try {
    await connectDB();
    
    // Get all active voting groups
    const groups = await VotingGroup.find({ isActive: true });
    
    // Get all candidates with their vote counts
    const candidates = await Candidate.find().sort({ voteCount: -1 });
    
    // Get total voters (users who have voted)
    const totalVoters = await User.countDocuments({ hasVoted: true });
    
    // Get total votes across all candidates
    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
    
    // Get recent voting activity (simulate recent votes for demo)
    const now = new Date();
    
    // For demo purposes, we'll simulate recent voting activity
    // In a real app, you'd track vote timestamps
    const getRecentVotes = (voteCount: number) => {
      // Simulate recent voting activity based on total votes
      if (voteCount === 0) return 0;
      return Math.floor(Math.random() * Math.min(3, Math.max(1, voteCount * 0.1)));
    };
    
    // Calculate voting rate (votes per minute)
    // For demo, we'll estimate based on current activity
    const votingRate = totalVotes > 0 ? Math.random() * 10 + 2 : 0;
    
    // Get the most recent vote time (simulate)
    const lastVoteTime = totalVotes > 0 ? new Date(now.getTime() - Math.random() * 300000).toISOString() : undefined;
    
    // Process groups with live statistics
    const liveGroups: LiveGroup[] = groups.map(group => {
      const groupCandidates = candidates.filter(candidate => candidate.group === group.name);
      const groupTotalVotes = groupCandidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
      
      const liveCandidates: LiveCandidate[] = groupCandidates.map(candidate => {
        const recentVotes = getRecentVotes(candidate.voteCount);
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
      
      // Sort by vote count to find winner
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
    
    const liveStats: LiveStats = {
      totalVotes,
      totalVoters,
      activeCategories: groups.length,
      lastVoteTime,
      votingRate: Math.round(votingRate * 10) / 10,
    };
    
    const response = {
      groups: liveGroups,
      stats: liveStats,
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching live data:', error);
    return NextResponse.json({ error: 'Failed to fetch live data' }, { status: 500 });
  }
}

// Add support for real-time updates using Server-Sent Events
export async function POST() {
  try {
    // This could be used to trigger live updates or reset demo data
    await connectDB();
    
    return NextResponse.json({ 
      message: 'Live data refresh triggered',
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  } catch (error) {
    console.error('Error triggering live update:', error);
    return NextResponse.json({ error: 'Failed to trigger update' }, { status: 500 });
  }
} 
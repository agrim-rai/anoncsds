import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import VotingGroup from '@/models/VotingGroup';

export async function GET() {
  try {
    await connectDB();
    
    const groups = await VotingGroup.find({ isActive: true });
    const candidates = await Candidate.find().sort({ voteCount: -1 });
    
    const results = groups.map(group => ({
      group: group.name,
      description: group.description,
      candidates: candidates
        .filter(candidate => candidate.group === group.name)
        .map(candidate => ({
          id: candidate._id,
          name: candidate.name,
          position: candidate.position,
          description: candidate.description,
          voteCount: candidate.voteCount
        }))
    }));

    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);

    return NextResponse.json({ 
      results,
      totalVotes,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
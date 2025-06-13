import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import VotingGroup from '@/models/VotingGroup';

export async function GET() {
  try {
    await connectDB();
    
    const groups = await VotingGroup.find({ isActive: true });
    const candidates = await Candidate.find();
    
    const groupedCandidates = groups.map(group => ({
      group: group.name,
      description: group.description,
      candidates: candidates.filter(candidate => candidate.group === group.name)
    }));

    return NextResponse.json({ groups: groupedCandidates }, { status: 200 });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}
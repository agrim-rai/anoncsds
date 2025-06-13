import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Candidate from '@/models/Candidate';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { candidateId } = await req.json();
    
    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    await connectDB();
    
    // Check if user has already voted
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (user.hasVoted) {
      return NextResponse.json({ error: 'You have already voted' }, { status: 400 });
    }

    // Find the candidate
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Update candidate vote count and mark user as voted
    await Promise.all([
      Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } }),
      User.findOneAndUpdate({ email: session.user.email }, { hasVoted: true })
    ]);

    return NextResponse.json({ message: 'Vote cast successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error casting vote:', error);
    return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
  }
}
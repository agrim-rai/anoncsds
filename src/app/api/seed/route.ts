import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VotingGroup from '@/models/VotingGroup';
import Candidate from '@/models/Candidate';

export async function POST() {
  try {
    await connectDB();
    
    // Clear existing data
    await VotingGroup.deleteMany({});
    await Candidate.deleteMany({});
    
    // Create voting groups
    const groups = [
      {
        name: 'Student President',
        description: 'Vote for the Student Council President',
        isActive: true
      },
      {
        name: 'Vice President',
        description: 'Vote for the Student Council Vice President',
        isActive: true
      },
      {
        name: 'Secretary',
        description: 'Vote for the Student Council Secretary',
        isActive: true
      },
      {
        name: 'Sports Captain',
        description: 'Vote for the Sports Captain',
        isActive: true
      }
    ];
    
    await VotingGroup.insertMany(groups);
    
    // Create candidates
    const candidates = [
      // Student President
      {
        name: 'Rahul Sharma',
        position: 'Student President Candidate',
        description: 'Experienced leader with a vision for student welfare',
        voteCount: 0,
        group: 'Student President'
      },
      {
        name: 'Priya Patel',
        position: 'Student President Candidate',
        description: 'Advocate for academic excellence and campus improvement',
        voteCount: 0,
        group: 'Student President'
      },
      {
        name: 'Arjun Singh',
        position: 'Student President Candidate',
        description: 'Tech enthusiast focused on digital campus transformation',
        voteCount: 0,
        group: 'Student President'
      },
      
      // Vice President
      {
        name: 'Sneha Gupta',
        position: 'Vice President Candidate',
        description: 'Committed to bridging student-administration gap',
        voteCount: 0,
        group: 'Vice President'
      },
      {
        name: 'Vikram Joshi',
        position: 'Vice President Candidate',
        description: 'Focused on mental health and student support services',
        voteCount: 0,
        group: 'Vice President'
      },
      
      // Secretary
      {
        name: 'Anita Verma',
        position: 'Secretary Candidate',
        description: 'Organized leader with excellent communication skills',
        voteCount: 0,
        group: 'Secretary'
      },
      {
        name: 'Rohit Kumar',
        position: 'Secretary Candidate',
        description: 'Detail-oriented with strong administrative background',
        voteCount: 0,
        group: 'Secretary'
      },
      {
        name: 'Kavya Reddy',
        position: 'Secretary Candidate',
        description: 'Passionate about transparency and student rights',
        voteCount: 0,
        group: 'Secretary'
      },
      
      // Sports Captain
      {
        name: 'Amit Thakur',
        position: 'Sports Captain Candidate',
        description: 'National level athlete with leadership experience',
        voteCount: 0,
        group: 'Sports Captain'
      },
      {
        name: 'Pooja Nair',
        position: 'Sports Captain Candidate',
        description: 'Multi-sport player focused on inclusive sports culture',
        voteCount: 0,
        group: 'Sports Captain'
      }
    ];
    
    await Candidate.insertMany(candidates);
    
    return NextResponse.json({ 
      message: 'Database seeded successfully',
      groups: groups.length,
      candidates: candidates.length
    }, { status: 200 });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
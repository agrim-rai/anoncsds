import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
  name: string;
  position: string;
  description?: string;
  voteCount: number;
  group: string;
  createdAt: Date;
}

const CandidateSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  voteCount: {
    type: Number,
    default: 0,
  },
  group: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);
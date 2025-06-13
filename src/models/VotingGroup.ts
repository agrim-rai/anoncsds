import mongoose, { Schema, Document } from 'mongoose';

export interface IVotingGroup extends Document {
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
}

const VotingGroupSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.VotingGroup || mongoose.model<IVotingGroup>('VotingGroup', VotingGroupSchema);
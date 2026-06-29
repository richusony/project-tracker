import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<INote>('Note', NoteSchema);

import mongoose, { Schema, type Model } from "mongoose";

export interface IStoredFile {
  _id: mongoose.Types.ObjectId;
  path: string;
  originalName: string;
  mimeType: string;
  conversationId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const StoredFileSchema = new Schema<IStoredFile>(
  {
    path: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
  },
  { timestamps: true }
);

StoredFileSchema.index({ conversationId: 1 });

export const StoredFile: Model<IStoredFile> =
  mongoose.models.StoredFile ?? mongoose.model<IStoredFile>("StoredFile", StoredFileSchema);

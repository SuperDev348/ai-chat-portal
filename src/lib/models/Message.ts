import mongoose, { Schema, type Model } from "mongoose";

export type MessageRole = "user" | "assistant" | "system";

export interface IMessageAttachment {
  type: "image" | "file";
  url: string;
  name?: string;
}

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  role: MessageRole;
  content: string;
  attachments?: IMessageAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageAttachmentSchema = new Schema<IMessageAttachment>(
  {
    type: { type: String, enum: ["image", "file"], required: true },
    url: { type: String, required: true },
    name: { type: String, default: null },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    attachments: { type: [MessageAttachmentSchema], default: [] },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message: Model<IMessage> =
  mongoose.models.Message ?? mongoose.model<IMessage>("Message", MessageSchema);

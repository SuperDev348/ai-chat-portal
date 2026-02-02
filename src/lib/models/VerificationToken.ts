import mongoose, { Schema, type Model } from "mongoose";

export interface IVerificationToken {
  _id: mongoose.Types.ObjectId;
  identifier: string;
  token: string;
  expires: Date;
}

const VerificationTokenSchema = new Schema<IVerificationToken>({
  identifier: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expires: { type: Date, required: true },
});

VerificationTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export const VerificationToken: Model<IVerificationToken> =
  mongoose.models.VerificationToken ??
  mongoose.model<IVerificationToken>("VerificationToken", VerificationTokenSchema);

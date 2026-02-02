import mongoose, { Schema, type Model } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  phone: string | null;
  birthday: string | null;
  password: string | null;
  provider: "credentials" | "email" | "oauth";
  providerAccountId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date, default: null },
    name: { type: String, default: null },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    image: { type: String, default: null },
    phone: { type: String, default: null },
    birthday: { type: String, default: null },
    password: { type: String, default: null },
    provider: { type: String, enum: ["credentials", "email", "oauth"], default: "credentials" },
    providerAccountId: { type: String, default: null },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

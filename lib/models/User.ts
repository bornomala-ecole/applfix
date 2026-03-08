import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  image?: string
  provider?: string
  role?: string
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: { type: String },

    image: { type: String },

    provider: {
      type: String,
      default: "credentials",
    },

    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
)

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
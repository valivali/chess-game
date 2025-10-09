import { Schema, model, Document } from "mongoose"
import { User } from "@/types/authTypes"

export interface UserDocument extends Omit<User, "id">, Document {
  _id: Schema.Types.ObjectId
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [2, "Username must be at least 2 characters long"],
      maxlength: [50, "Username must be less than 50 characters long"],
      match: [/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"]
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: [60, "Password hash must be at least 60 characters long"] // bcrypt hash length
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: "users"
  }
)

// Indexes for performance
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })

// Remove password hash from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject()
  delete userObject.passwordHash
  return userObject
}

export const UserModel = model<UserDocument>("User", userSchema)

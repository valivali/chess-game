import { Schema, model, Document } from "mongoose"
import { RefreshToken } from "@/types/auth-types"

export interface RefreshTokenDocument extends Omit<RefreshToken, "id">, Document {
  _id: Schema.Types.ObjectId
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    userId: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 } // MongoDB TTL index - automatically removes expired tokens
    }
  },
  {
    timestamps: true,
    collection: "refresh_tokens"
  }
)

// Indexes for performance
refreshTokenSchema.index({ userId: 1 })
refreshTokenSchema.index({ token: 1 })

export const RefreshTokenModel = model<RefreshTokenDocument>("RefreshToken", refreshTokenSchema)

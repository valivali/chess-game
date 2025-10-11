import { Schema } from "mongoose"

/**
 * Base interface for all database documents
 * Contains MongoDB-specific fields that all documents have
 */
export interface BaseDbDocument {
  _id: Schema.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

/**
 * Base interface for database document creation
 * Excludes auto-generated fields
 */
export interface BaseDbCreate {
  // No _id, createdAt, updatedAt - these are auto-generated
}

/**
 * Base interface for database document updates
 * Excludes immutable fields
 */
export interface BaseDbUpdate {
  updatedAt?: Date
  // No _id, createdAt - these are immutable
}

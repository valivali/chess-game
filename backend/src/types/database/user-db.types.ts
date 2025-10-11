import { BaseDbCreate, BaseDbDocument, BaseDbUpdate } from '@/types'

export interface UserDbDocument extends BaseDbDocument {
  id: string // UUID - our business identifier
  email: string
  username: string
  passwordHash: string
  isEmailVerified: boolean
}

export interface UserDbCreate extends BaseDbCreate {
  id?: string // Optional - will be auto-generated if not provided
  email: string
  username: string
  passwordHash: string
  isEmailVerified: boolean
}

export interface UserDbUpdate extends BaseDbUpdate {
  email?: string
  username?: string
  passwordHash?: string
  isEmailVerified?: boolean
}

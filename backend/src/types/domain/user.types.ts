import { BaseDomainCreate, BaseDomainEntity, BaseDomainUpdate } from '@/types'

export interface User extends BaseDomainEntity {
  email: string
  username: string
  passwordHash: string // Business logic may need this for validation
  isEmailVerified: boolean
}

export interface UserCreate extends BaseDomainCreate {
  email: string
  username: string
  passwordHash: string
  isEmailVerified?: boolean // Optional - defaults to false
}

export interface UserUpdate extends BaseDomainUpdate {
  email?: string
  username?: string
  passwordHash?: string
  isEmailVerified?: boolean
}

export interface PublicUser extends Omit<User, 'passwordHash'> {
  // Inherits all User fields except passwordHash
}

import { User, UserCreate, UserUpdate } from '@/types/domain'
import { BaseDaoInterface } from '@/persistence'

export interface UserDaoInterface extends BaseDaoInterface<User, UserCreate, UserUpdate> {
  findByEmail(email: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  verifyEmail(userId: string): Promise<boolean>
  emailExists(email: string): Promise<boolean>
  usernameExists(username: string): Promise<boolean>
}

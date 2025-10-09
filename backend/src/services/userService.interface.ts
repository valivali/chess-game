import { User, RegisterRequest } from "@/types/authTypes"

export interface UserServiceInterface {
  createUser(userData: RegisterRequest): Promise<User>
  findUserById(id: string): Promise<User | null>
  findUserByEmail(email: string): Promise<User | null>
  findUserByUsername(username: string): Promise<User | null>
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>
  updateUser(id: string, updates: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<User | null>
  deleteUser(id: string): Promise<boolean>
  verifyEmail(userId: string): Promise<boolean>
}

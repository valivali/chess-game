import bcrypt from "bcryptjs"
import { UserModel } from "@/models/UserModel"
import { User, RegisterRequest } from "@/types/authTypes"
import { UserServiceInterface } from "./userService.interface"

export class UserService implements UserServiceInterface {
  private readonly saltRounds = 12

  async createUser(userData: RegisterRequest): Promise<User> {
    const { email, username, password } = userData

    // Check if user already exists
    const existingUserByEmail = await this.findUserByEmail(email)
    if (existingUserByEmail) {
      throw new Error("User with this email already exists")
    }

    const existingUserByUsername = await this.findUserByUsername(username)
    if (existingUserByUsername) {
      throw new Error("User with this username already exists")
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.saltRounds)

    // Create user
    const userDocument = new UserModel({
      email,
      username,
      passwordHash,
      isEmailVerified: false
    })

    const savedUser = await userDocument.save()
    return this.documentToUser(savedUser)
  }

  async findUserById(id: string): Promise<User | null> {
    try {
      const userDocument = await UserModel.findById(id).exec()
      return userDocument ? this.documentToUser(userDocument) : null
    } catch (error) {
      return null
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const userDocument = await UserModel.findOne({ email: email.toLowerCase() }).exec()
      return userDocument ? this.documentToUser(userDocument) : null
    } catch (error) {
      return null
    }
  }

  async findUserByUsername(username: string): Promise<User | null> {
    try {
      const userDocument = await UserModel.findOne({ username }).exec()
      return userDocument ? this.documentToUser(userDocument) : null
    } catch (error) {
      return null
    }
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword)
    } catch (error) {
      return false
    }
  }

  async updateUser(id: string, updates: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<User | null> {
    try {
      // If password is being updated, hash it
      if (updates.passwordHash) {
        updates.passwordHash = await bcrypt.hash(updates.passwordHash, this.saltRounds)
      }

      const userDocument = await UserModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).exec()

      return userDocument ? this.documentToUser(userDocument) : null
    } catch (error) {
      return null
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndDelete(id).exec()
      return result !== null
    } catch (error) {
      return false
    }
  }

  async verifyEmail(userId: string): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndUpdate(userId, { isEmailVerified: true, updatedAt: new Date() }, { new: true }).exec()
      return result !== null
    } catch (error) {
      return false
    }
  }

  private documentToUser(document: any): User {
    return {
      id: document._id.toString(),
      email: document.email,
      username: document.username,
      passwordHash: document.passwordHash,
      isEmailVerified: document.isEmailVerified,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    }
  }

  static build(): UserService {
    return new UserService()
  }
}

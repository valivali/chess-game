import bcrypt from "bcryptjs"
import { User, UserCreate, UserUpdate } from "@/types/domain"
import { RegisterRequest } from "@/types/api"
import { UserServiceInterface } from "./user.interface"
import { UserDaoInterface, UserDao } from "@/persistence"

export class UserService implements UserServiceInterface {
  private readonly saltRounds = 12

  constructor(private readonly userDao: UserDaoInterface) {}

  async createUser(userData: RegisterRequest): Promise<User> {
    const { email, username, password } = userData

    const emailExists = await this.userDao.emailExists(email)
    if (emailExists) {
      throw new Error("User with this email already exists")
    }

    const usernameExists = await this.userDao.usernameExists(username)
    if (usernameExists) {
      throw new Error("User with this username already exists")
    }

    const passwordHash = await bcrypt.hash(password, this.saltRounds)

    const userCreate: UserCreate = {
      email,
      username,
      passwordHash,
      isEmailVerified: false
    }

    return await this.userDao.create(userCreate)
  }

  async findUserById(id: string): Promise<User | null> {
    return await this.userDao.findById(id)
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userDao.findByEmail(email)
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return await this.userDao.findByUsername(username)
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword)
    } catch (error) {
      return false
    }
  }

  async updateUser(id: string, updates: UserUpdate): Promise<User | null> {
    // If password is being updated, hash it
    if (updates.passwordHash) {
      updates.passwordHash = await bcrypt.hash(updates.passwordHash, this.saltRounds)
    }

    return await this.userDao.update(id, updates)
  }

  async deleteUser(id: string): Promise<boolean> {
    return await this.userDao.delete(id)
  }

  async verifyEmail(userId: string): Promise<boolean> {
    return await this.userDao.verifyEmail(userId)
  }

  static build(): UserService {
    return new UserService(UserDao.build())
  }
}

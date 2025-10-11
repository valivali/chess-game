import { User, UserCreate, UserUpdate } from '@/types/domain'
import { UserModel } from '@/models/user'
import { UserDaoInterface, UserMapper, UserMapperInterface } from '@/persistence'

export class UserDao implements UserDaoInterface {
  constructor(private readonly mapper: UserMapperInterface) {}

  async create(userCreate: UserCreate): Promise<User> {
    const dbData = this.mapper.toSchema(userCreate)
    const userDocument = new UserModel(dbData)
    const savedUser = await userDocument.save()
    return this.mapper.fromSchema(savedUser)
  }

  async findById(id: string): Promise<User | null> {
    try {
      const userDocument = await UserModel.findOne({ id }).exec()
      return userDocument ? this.mapper.fromSchema(userDocument) : null
    } catch (error) {
      return null
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const userDocument = await UserModel.findOne({ email: email.toLowerCase() }).exec()
      return userDocument ? this.mapper.fromSchema(userDocument) : null
    } catch (error) {
      return null
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const userDocument = await UserModel.findOne({ username }).exec()
      return userDocument ? this.mapper.fromSchema(userDocument) : null
    } catch (error) {
      return null
    }
  }

  async update(id: string, updates: UserUpdate): Promise<User | null> {
    try {
      const userDocument = await UserModel.findOneAndUpdate(
        { id },
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).exec()

      return userDocument ? this.mapper.fromSchema(userDocument) : null
    } catch (error) {
      return null
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await UserModel.findOneAndDelete({ id }).exec()
      return result !== null
    } catch (error) {
      return false
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await UserModel.countDocuments({ id }).exec()
      return count > 0
    } catch (error) {
      return false
    }
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const count = await UserModel.countDocuments({ email: email.toLowerCase() }).exec()
      return count > 0
    } catch (error) {
      return false
    }
  }

  async usernameExists(username: string): Promise<boolean> {
    try {
      const count = await UserModel.countDocuments({ username }).exec()
      return count > 0
    } catch (error) {
      return false
    }
  }

  async verifyEmail(userId: string): Promise<boolean> {
    try {
      const result = await UserModel.findOneAndUpdate(
        { id: userId },
        { isEmailVerified: true, updatedAt: new Date() },
        { new: true }
      ).exec()
      return result !== null
    } catch (error) {
      return false
    }
  }

  static build(): UserDao {
    return new UserDao(UserMapper.build())
  }
}

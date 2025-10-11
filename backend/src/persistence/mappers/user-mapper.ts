import { PublicUser, User, UserCreate } from '@/types/domain'
import { UserDbCreate } from '@/types/database'
import { UserDocument } from '@/models/user'
import { UserMapperInterface } from '@/persistence'

export class UserMapper implements UserMapperInterface {
  fromSchema(document: UserDocument): User {
    return {
      id: document.id,
      email: document.email,
      username: document.username,
      passwordHash: document.passwordHash,
      isEmailVerified: document.isEmailVerified,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    }
  }

  fromSchemaPublic(document: UserDocument): PublicUser {
    return {
      id: document.id,
      email: document.email,
      username: document.username,
      isEmailVerified: document.isEmailVerified,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    }
  }

  toSchema(userCreate: UserCreate): UserDbCreate {
    return {
      email: userCreate.email,
      username: userCreate.username,
      passwordHash: userCreate.passwordHash,
      isEmailVerified: userCreate.isEmailVerified ?? false
    }
  }

  static build(): UserMapper {
    return new UserMapper()
  }
}

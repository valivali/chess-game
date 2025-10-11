import { PublicUser, User, UserCreate } from '@/types/domain'
import { UserDbCreate } from '@/types/database'
import { UserDocument } from '@/models/user'

export interface UserMapperInterface {
  fromSchema(document: UserDocument): User
  fromSchemaPublic(document: UserDocument): PublicUser
  toSchema(userCreate: UserCreate): UserDbCreate
}

import { BaseDomainCreate, BaseDomainEntity, BaseDomainUpdate } from "@/types/domain"

export interface BaseDaoInterface<
  TEntity extends BaseDomainEntity,
  TCreate extends BaseDomainCreate = BaseDomainCreate,
  TUpdate extends BaseDomainUpdate = BaseDomainUpdate,
  TId = string
> {
  create(createData: TCreate): Promise<TEntity>
  findById(id: TId): Promise<TEntity | null>
  update(id: TId, updates: TUpdate): Promise<TEntity | null>
  delete(id: TId): Promise<boolean>
  exists(id: TId): Promise<boolean>
}

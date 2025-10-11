import { BaseDomainEntity, BaseDomainCreate, BaseDomainUpdate } from "@/types/domain"

/**
 * Base interface for all DAO (Data Access Object) operations
 * Provides consistent CRUD operations for all entities
 */
export interface BaseDaoInterface<
  TEntity extends BaseDomainEntity,
  TCreate extends BaseDomainCreate = BaseDomainCreate,
  TUpdate extends BaseDomainUpdate = BaseDomainUpdate,
  TId = string
> {
  /**
   * Create a new entity
   */
  create(createData: TCreate): Promise<TEntity>

  /**
   * Find entity by ID
   */
  findById(id: TId): Promise<TEntity | null>

  /**
   * Update entity by ID
   */
  update(id: TId, updates: TUpdate): Promise<TEntity | null>

  /**
   * Delete entity by ID
   */
  delete(id: TId): Promise<boolean>

  /**
   * Check if entity exists by ID
   */
  exists(id: TId): Promise<boolean>
}

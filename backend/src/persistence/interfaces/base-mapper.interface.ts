/**
 * Base interface for all entity mappers
 * Provides consistent mapping contracts between domain entities and database documents
 */
export interface BaseMapperInterface<TEntity, TDocument> {
  /**
   * Converts a database document to a domain entity
   */
  fromSchema(document: TDocument): TEntity

  /**
   * Converts a domain entity to database document creation data
   * Excludes generated fields like id, createdAt, updatedAt
   */
  toSchema(entity: Partial<TEntity>): Partial<TDocument>
}

/**
 * Extended mapper interface for entities that need public/sanitized representations
 */
export interface PublicMapperInterface<TEntity, TDocument, TPublicEntity> extends BaseMapperInterface<TEntity, TDocument> {
  /**
   * Converts a database document to a public/sanitized entity (e.g., without sensitive fields)
   */
  fromSchemaPublic(document: TDocument): TPublicEntity
}

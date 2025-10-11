/**
 * Base interface for all domain entities
 * Contains fields that all business entities have
 */
export interface BaseDomainEntity {
  id: string // Always UUID in business logic
  createdAt: Date
  updatedAt: Date
}

/**
 * Base interface for domain entity creation
 * Excludes auto-generated fields
 */
export interface BaseDomainCreate {
  // No id, createdAt, updatedAt - these are handled by the system
}

/**
 * Base interface for domain entity updates
 * Excludes immutable fields
 */
export interface BaseDomainUpdate {
  // No id, createdAt, updatedAt - these are immutable in business logic
}

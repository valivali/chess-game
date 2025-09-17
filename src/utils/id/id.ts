/**
 * Creates a unique ID generator function with an internal counter
 * @returns A function that generates unique IDs with optional prefix
 */
export const createUniqueId = (() => {
  let counter = 0
  return (prefix: string = "") => `${prefix}${Date.now()}-${++counter}-${Math.random().toString(36).substr(2, 9)}`
})()

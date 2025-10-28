# API Layer - React Query Integration

This directory contains all React Query related code for the Chess Game frontend application.

## 📁 Directory Structure

```
src/api/
├── queries/           # React Query hooks for data fetching
│   ├── useActiveGamesQuery.ts
│   ├── useGameHistoryQuery.ts
│   ├── useAuthQueries.ts
│   └── index.ts
├── mutations/         # React Query hooks for data mutations
│   ├── useCreateGameMutation.ts
│   ├── useAuthMutations.ts
│   └── index.ts
├── hooks/            # Integration and utility hooks
│   ├── useAuthIntegration.ts
│   └── index.ts
├── queryClient.ts    # QueryClient configuration
├── queryKeys.ts      # Centralized query keys
└── index.ts          # Main exports
```

## 🎯 Key Features

### **Queries (Data Fetching)**

- **`useActiveGamesQuery`** - Fetches active games with pagination and real-time updates
- **`useGameHistoryQuery`** - Fetches game history with pagination
- **`useGameHistoryInfiniteQuery`** - Infinite scrolling version for better UX
- **`useProfileQuery`** - Fetches user profile data

### **Mutations (Data Updates)**

- **`useCreateGameMutation`** - Creates new games with optimistic updates
- **`useLoginMutation`** - Handles user login
- **`useRegisterMutation`** - Handles user registration
- **`useLogoutMutation`** - Handles user logout with cache clearing

### **Integration Hooks**

- **`useAuthIntegration`** - Bridges existing AuthContext with React Query
- **`useAuthSync`** - Syncs auth state with React Query cache

## 🔧 Configuration

### QueryClient Setup

The QueryClient is configured with:

- **5-minute stale time** for most queries
- **Automatic retries** with smart error handling
- **Authentication error handling** with automatic logout
- **Background refetching** on window focus

### Query Keys

Centralized query keys following TanStack Query best practices:

```typescript
queryKeys.games.active(page, limit) // ['games', 'active', { page, limit }]
queryKeys.games.history() // ['games', 'history']
queryKeys.auth.profile() // ['auth', 'profile']
```

## 🚀 Usage Examples

### Basic Query Usage

```typescript
import { useActiveGamesQuery } from '@/api/queries'

const MyComponent = () => {
  const { data, isLoading, error } = useActiveGamesQuery({ page: 1, limit: 10 })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{data?.items.map(game => ...)}</div>
}
```

### Mutation Usage

```typescript
import { useCreateGameMutation } from '@/api/mutations'

const MyComponent = () => {
  const { mutate: createGame, isPending, error } = useCreateGameMutation()

  const handleCreateGame = () => {
    createGame({ playerName: 'John' })
  }

  return (
    <button onClick={handleCreateGame} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create Game'}
    </button>
  )
}
```

## 📈 Benefits Over Previous Implementation

### **Code Reduction**

- **Before**: ~170 lines for data fetching hooks
- **After**: ~40 lines with React Query
- **Savings**: ~130 lines of boilerplate code

### **Enhanced Features**

- ✅ Automatic background refetching every 30 seconds for active games
- ✅ Smart caching with 5-minute stale time
- ✅ Optimistic updates for better UX
- ✅ Automatic retry on network failures
- ✅ Request deduplication
- ✅ Real-time sync capabilities
- ✅ Built-in loading and error states

### **Better User Experience**

- ⚡ Instant loading from cache
- 🔄 Background data synchronization
- 📱 Better offline experience
- 🎯 Optimistic UI updates
- 🚀 Infinite scrolling support

## 🔄 Migration Notes

The new React Query hooks maintain backward compatibility with the existing component interfaces:

- `useActiveGames(isAuthenticated, page)` - Same interface as before
- `useGameHistory(isAuthenticated, page)` - Same interface as before
- `useCreateGame()` - Simplified interface with better error handling

This allows for seamless migration without breaking existing components.

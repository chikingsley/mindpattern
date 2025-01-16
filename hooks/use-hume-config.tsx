'use client'

import { useUser } from '@clerk/nextjs'

export function useHumeConfig() {
  const { user, isLoaded, isSignedIn } = useUser()
  
  return {
    configId: user?.publicMetadata?.humeConfigId as string | null,
    loading: !isLoaded,
    error: isLoaded && !isSignedIn ? 'Not authenticated' : null
  }
}

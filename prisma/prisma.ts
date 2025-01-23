import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? (() => {
  console.log('Initializing new PrismaClient...')
  const client = new PrismaClient({
    log: ['query', 'error', 'warn']
  })
  console.log('PrismaClient initialized')
  return client
})()

if (process.env.NODE_ENV !== 'production') {
  console.log('Development environment detected, setting global prisma instance')
  globalForPrisma.prisma = prisma
}

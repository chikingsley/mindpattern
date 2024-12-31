import { eq } from 'drizzle-orm';
import { db } from '../index';
import { ResourceCache, NewResourceCache, resourceCache } from '../schema';

export async function getResourceByTypeAndId(resourceType: string, resourceId: string, userId: string) {
  return db
    .select()
    .from(resourceCache)
    .where(
      eq(resourceCache.resourceType, resourceType) &&
      eq(resourceCache.resourceId, resourceId) &&
      eq(resourceCache.userId, userId)
    );
}

export async function createResource(data: NewResourceCache) {
  return db.insert(resourceCache).values(data);
}

export async function updateResource(
  resourceType: string,
  resourceId: string,
  userId: string,
  data: Partial<Omit<ResourceCache, 'id' | 'createdAt' | 'updatedAt'>>
) {
  return db
    .update(resourceCache)
    .set({ ...data, updatedAt: new Date() })
    .where(
      eq(resourceCache.resourceType, resourceType) &&
      eq(resourceCache.resourceId, resourceId) &&
      eq(resourceCache.userId, userId)
    );
}

export async function deleteResource(resourceType: string, resourceId: string, userId: string) {
  return db
    .delete(resourceCache)
    .where(
      eq(resourceCache.resourceType, resourceType) &&
      eq(resourceCache.resourceId, resourceId) &&
      eq(resourceCache.userId, userId)
    );
}

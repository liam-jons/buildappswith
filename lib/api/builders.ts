import { Builder } from '../types/builder';
import { getMockBuilderById, getMockBuilderByUsername } from '../data/mockBuilders';

/**
 * Get a builder by ID - uses mock data for now, will be replaced with API calls
 */
export async function getBuilderById(id: string): Promise<Builder | null> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get mock data
  const builder = getMockBuilderById(id);
  return builder || null;
}

/**
 * Get a builder by username - uses mock data for now, will be replaced with API calls
 */
export async function getBuilderByUsername(username: string): Promise<Builder | null> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get mock data
  const builder = getMockBuilderByUsername(username);
  return builder || null;
}

/**
 * Update a builder profile - currently just returns the input without changes
 * Will be replaced with actual API calls
 */
export async function updateBuilder(builder: Partial<Builder> & { id: string }): Promise<Builder | null> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get the existing builder
  const existingBuilder = await getBuilderById(builder.id);
  if (!existingBuilder) return null;
  
  // Return a merged version (simulating an update)
  return {
    ...existingBuilder,
    ...builder,
    updatedAt: new Date().toISOString()
  };
}

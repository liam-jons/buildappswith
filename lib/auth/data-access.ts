import { db } from '@/lib/db';
import { UserRole } from '@/lib/auth/types';

/**
 * Data access layer for auth-related operations
 * Abstracts database operations related to authentication
 */
export const authData = {
  /**
   * Find a user by Clerk ID
   * @param clerkId Clerk user ID
   * @returns User or null if not found
   */
  findUserByClerkId: async (clerkId: string) => {
    if (!clerkId) return null;
    
    return db.user.findUnique({
      where: { clerkId }
    });
  },
  
  /**
   * Find a user by email
   * @param email User email
   * @returns User or null if not found
   */
  findUserByEmail: async (email: string) => {
    if (!email) return null;
    
    return db.user.findUnique({
      where: { email }
    });
  },
  
  /**
   * Create a new user with Clerk ID
   * @param data User data
   * @returns Created user
   */
  createUser: async (data: {
    clerkId: string;
    name: string | null;
    email: string;
    image: string | null;
    roles?: UserRole[];
    verified?: boolean;
  }) => {
    return db.user.create({
      data: {
        clerkId: data.clerkId,
        name: data.name,
        email: data.email,
        imageUrl: data.image,
        roles: data.roles || [UserRole.CLIENT],
        verified: data.verified ?? true // Clerk has already verified the email
      }
    });
  },
  
  /**
   * Update a user's Clerk ID
   * @param userId Database user ID
   * @param clerkId Clerk user ID
   * @returns Updated user
   */
  updateUserClerkId: async (userId: string, clerkId: string) => {
    return db.user.update({
      where: { id: userId },
      data: { clerkId }
    });
  },
  
  /**
   * Update user data
   * @param userId Database user ID
   * @param data User data to update
   * @returns Updated user
   */
  updateUser: async (userId: string, data: {
    name?: string | null;
    email?: string;
    image?: string | null;
    roles?: UserRole[];
    verified?: boolean;
    stripeCustomerId?: string | null;
  }) => {
    return db.user.update({
      where: { id: userId },
      data
    });
  },
  
  /**
   * Get user with builder profile
   * @param userId Database user ID
   * @returns User with builder profile or null
   */
  getUserWithBuilderProfile: async (userId: string) => {
    return db.user.findUnique({
      where: { id: userId },
      include: {
        builderProfile: {
          include: {
            skills: {
              include: {
                skill: true
              }
            }
          }
        }
      }
    });
  },
  
  /**
   * Add role to user
   * @param userId Database user ID
   * @param role Role to add
   * @returns Updated user
   */
  addRole: async (userId: string, role: UserRole) => {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { roles: true }
    });
    
    if (!user) throw new Error('User not found');
    
    // Only add the role if it doesn't already exist
    if (!user.roles.includes(role)) {
      return db.user.update({
        where: { id: userId },
        data: {
          roles: [...user.roles, role]
        }
      });
    }
    
    return db.user.findUnique({ where: { id: userId } });
  },
  
  /**
   * Remove role from user
   * @param userId Database user ID
   * @param role Role to remove
   * @returns Updated user
   */
  removeRole: async (userId: string, role: UserRole) => {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { roles: true }
    });
    
    if (!user) throw new Error('User not found');
    
    // Filter out the role to remove
    return db.user.update({
      where: { id: userId },
      data: {
        roles: user.roles.filter(r => r !== role)
      }
    });
  }
};

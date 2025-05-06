/**
 * Profile server actions
 * Version: 1.0.0
 * 
 * Server-side actions for profile functionality
 */

'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { logger } from '../logger'

import type { 
  BuilderProfileResponse, 
  ExpertiseAreasUpdate,
  SessionTypeWithId,
  UpdateBuilderProfileData
} from './types'

const prisma = new PrismaClient()

/**
 * Get the current builder profile for the authenticated user
 */
export async function getCurrentBuilderProfile(): Promise<BuilderProfileResponse | null> {
  try {
    const { userId: clerkId } = auth()
    
    if (!clerkId) {
      logger.warn('getCurrentBuilderProfile: No authenticated user')
      return null
    }
    
    // Get user from database using clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        builderProfile: true
      }
    })
    
    if (!user || !user.builderProfile) {
      logger.warn('getCurrentBuilderProfile: No builder profile found', { clerkId })
      return null
    }
    
    return {
      userId: user.id,
      clerkId: user.clerkId || undefined,
      email: user.email,
      name: user.name || undefined,
      profile: {
        id: user.builderProfile.id,
        bio: user.builderProfile.bio || undefined,
        headline: user.builderProfile.headline || undefined,
        slug: user.builderProfile.slug || undefined,
        tagline: user.builderProfile.tagline || undefined,
        displayName: user.builderProfile.displayName || undefined,
        validationTier: user.builderProfile.validationTier,
        domains: user.builderProfile.domains,
        badges: user.builderProfile.badges,
        completedProjects: user.builderProfile.completedProjects,
        responseRate: user.builderProfile.responseRate || undefined,
        hourlyRate: user.builderProfile.hourlyRate?.toNumber() || undefined,
        availableForHire: user.builderProfile.availableForHire,
        adhd_focus: user.builderProfile.adhd_focus || false,
        expertiseAreas: user.builderProfile.expertiseAreas as Record<string, any> || {},
        socialLinks: user.builderProfile.socialLinks as Record<string, string> || {},
        portfolioItems: user.builderProfile.portfolioItems as any[] || [],
        featured: user.builderProfile.featured,
        searchable: user.builderProfile.searchable,
        availability: user.builderProfile.availability,
        topSkills: user.builderProfile.topSkills
      }
    }
  } catch (error) {
    logger.error('Error in getCurrentBuilderProfile', { error })
    throw new Error('Failed to get builder profile')
  }
}

/**
 * Get a builder profile by slug
 */
export async function getBuilderProfileBySlug(slug: string): Promise<BuilderProfileResponse | null> {
  try {
    // Validate slug
    if (!slug || typeof slug !== 'string') {
      logger.warn('getBuilderProfileBySlug: Invalid slug', { slug })
      return null
    }
    
    // Get builder profile from database
    const builderProfile = await prisma.builderProfile.findUnique({
      where: { slug },
      include: {
        user: true
      }
    })
    
    if (!builderProfile || !builderProfile.user) {
      logger.warn('getBuilderProfileBySlug: No builder profile found', { slug })
      return null
    }
    
    return {
      userId: builderProfile.user.id,
      clerkId: builderProfile.user.clerkId || undefined,
      email: builderProfile.user.email,
      name: builderProfile.user.name || undefined,
      profile: {
        id: builderProfile.id,
        bio: builderProfile.bio || undefined,
        headline: builderProfile.headline || undefined,
        slug: builderProfile.slug || undefined,
        tagline: builderProfile.tagline || undefined,
        displayName: builderProfile.displayName || undefined,
        validationTier: builderProfile.validationTier,
        domains: builderProfile.domains,
        badges: builderProfile.badges,
        completedProjects: builderProfile.completedProjects,
        responseRate: builderProfile.responseRate || undefined,
        hourlyRate: builderProfile.hourlyRate?.toNumber() || undefined,
        availableForHire: builderProfile.availableForHire,
        adhd_focus: builderProfile.adhd_focus || false,
        expertiseAreas: builderProfile.expertiseAreas as Record<string, any> || {},
        socialLinks: builderProfile.socialLinks as Record<string, string> || {},
        portfolioItems: builderProfile.portfolioItems as any[] || [],
        featured: builderProfile.featured,
        searchable: builderProfile.searchable,
        availability: builderProfile.availability,
        topSkills: builderProfile.topSkills
      }
    }
  } catch (error) {
    logger.error('Error in getBuilderProfileBySlug', { error, slug })
    throw new Error('Failed to get builder profile')
  }
}

/**
 * Update the builder profile for the authenticated user
 */
export async function updateBuilderProfile(data: UpdateBuilderProfileData): Promise<BuilderProfileResponse | null> {
  try {
    const { userId: clerkId } = auth()
    
    if (!clerkId) {
      logger.warn('updateBuilderProfile: No authenticated user')
      return null
    }
    
    // Get user from database using clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        builderProfile: true
      }
    })
    
    if (!user || !user.builderProfile) {
      logger.warn('updateBuilderProfile: No builder profile found', { clerkId })
      return null
    }
    
    // Validate slug if provided
    if (data.slug) {
      // Check if slug is already taken by another user
      const existingProfile = await prisma.builderProfile.findUnique({
        where: { slug: data.slug }
      })
      
      if (existingProfile && existingProfile.id !== user.builderProfile.id) {
        logger.warn('updateBuilderProfile: Slug already taken', { slug: data.slug })
        throw new Error('Slug is already taken')
      }
    }
    
    // Update builder profile
    const updatedProfile = await prisma.builderProfile.update({
      where: { id: user.builderProfile.id },
      data: {
        bio: data.bio !== undefined ? data.bio : user.builderProfile.bio,
        headline: data.headline !== undefined ? data.headline : user.builderProfile.headline,
        slug: data.slug !== undefined ? data.slug : user.builderProfile.slug,
        tagline: data.tagline !== undefined ? data.tagline : user.builderProfile.tagline,
        displayName: data.displayName !== undefined ? data.displayName : user.builderProfile.displayName,
        domains: data.domains !== undefined ? data.domains : user.builderProfile.domains,
        badges: data.badges !== undefined ? data.badges : user.builderProfile.badges,
        hourlyRate: data.hourlyRate !== undefined ? data.hourlyRate : user.builderProfile.hourlyRate,
        availableForHire: data.availableForHire !== undefined ? data.availableForHire : user.builderProfile.availableForHire,
        adhd_focus: data.adhd_focus !== undefined ? data.adhd_focus : user.builderProfile.adhd_focus,
        socialLinks: data.socialLinks !== undefined ? data.socialLinks : user.builderProfile.socialLinks,
        portfolioItems: data.portfolioItems !== undefined ? data.portfolioItems : user.builderProfile.portfolioItems,
        searchable: data.searchable !== undefined ? data.searchable : user.builderProfile.searchable,
        availability: data.availability !== undefined ? data.availability : user.builderProfile.availability,
        topSkills: data.topSkills !== undefined ? data.topSkills : user.builderProfile.topSkills
      }
    })
    
    // Revalidate profile path
    revalidatePath(`/profile/${updatedProfile.slug || user.id}`)
    
    return {
      userId: user.id,
      clerkId: user.clerkId || undefined,
      email: user.email,
      name: user.name || undefined,
      profile: {
        id: updatedProfile.id,
        bio: updatedProfile.bio || undefined,
        headline: updatedProfile.headline || undefined,
        slug: updatedProfile.slug || undefined,
        tagline: updatedProfile.tagline || undefined,
        displayName: updatedProfile.displayName || undefined,
        validationTier: updatedProfile.validationTier,
        domains: updatedProfile.domains,
        badges: updatedProfile.badges,
        completedProjects: updatedProfile.completedProjects,
        responseRate: updatedProfile.responseRate || undefined,
        hourlyRate: updatedProfile.hourlyRate?.toNumber() || undefined,
        availableForHire: updatedProfile.availableForHire,
        adhd_focus: updatedProfile.adhd_focus || false,
        expertiseAreas: updatedProfile.expertiseAreas as Record<string, any> || {},
        socialLinks: updatedProfile.socialLinks as Record<string, string> || {},
        portfolioItems: updatedProfile.portfolioItems as any[] || [],
        featured: updatedProfile.featured,
        searchable: updatedProfile.searchable,
        availability: updatedProfile.availability,
        topSkills: updatedProfile.topSkills
      }
    }
  } catch (error) {
    logger.error('Error in updateBuilderProfile', { error })
    throw new Error('Failed to update builder profile')
  }
}

/**
 * Update expertise areas for the authenticated user's profile
 */
export async function updateExpertiseAreas(data: ExpertiseAreasUpdate): Promise<BuilderProfileResponse | null> {
  try {
    const { userId: clerkId } = auth()
    
    if (!clerkId) {
      logger.warn('updateExpertiseAreas: No authenticated user')
      return null
    }
    
    // Get user from database using clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        builderProfile: true
      }
    })
    
    if (!user || !user.builderProfile) {
      logger.warn('updateExpertiseAreas: No builder profile found', { clerkId })
      return null
    }
    
    // Update expertise areas
    const updatedProfile = await prisma.builderProfile.update({
      where: { id: user.builderProfile.id },
      data: {
        expertiseAreas: data
      }
    })
    
    // Revalidate profile path
    revalidatePath(`/profile/${updatedProfile.slug || user.id}`)
    
    return {
      userId: user.id,
      clerkId: user.clerkId || undefined,
      email: user.email,
      name: user.name || undefined,
      profile: {
        id: updatedProfile.id,
        bio: updatedProfile.bio || undefined,
        headline: updatedProfile.headline || undefined,
        slug: updatedProfile.slug || undefined,
        tagline: updatedProfile.tagline || undefined,
        displayName: updatedProfile.displayName || undefined,
        validationTier: updatedProfile.validationTier,
        domains: updatedProfile.domains,
        badges: updatedProfile.badges,
        completedProjects: updatedProfile.completedProjects,
        responseRate: updatedProfile.responseRate || undefined,
        hourlyRate: updatedProfile.hourlyRate?.toNumber() || undefined,
        availableForHire: updatedProfile.availableForHire,
        adhd_focus: updatedProfile.adhd_focus || false,
        expertiseAreas: updatedProfile.expertiseAreas as Record<string, any> || {},
        socialLinks: updatedProfile.socialLinks as Record<string, string> || {},
        portfolioItems: updatedProfile.portfolioItems as any[] || [],
        featured: updatedProfile.featured,
        searchable: updatedProfile.searchable,
        availability: updatedProfile.availability,
        topSkills: updatedProfile.topSkills
      }
    }
  } catch (error) {
    logger.error('Error in updateExpertiseAreas', { error })
    throw new Error('Failed to update expertise areas')
  }
}

/**
 * Get session types for a builder profile
 */
export async function getSessionTypes(builderId?: string): Promise<SessionTypeWithId[]> {
  try {
    let profileId: string | undefined
    
    // If builderId is provided, use it directly
    if (builderId) {
      profileId = builderId
    } else {
      // Otherwise, get the current user's profile
      const { userId: clerkId } = auth()
      
      if (!clerkId) {
        logger.warn('getSessionTypes: No authenticated user')
        return []
      }
      
      const user = await prisma.user.findUnique({
        where: { clerkId },
        include: {
          builderProfile: true
        }
      })
      
      if (!user || !user.builderProfile) {
        logger.warn('getSessionTypes: No builder profile found', { clerkId })
        return []
      }
      
      profileId = user.builderProfile.id
    }
    
    // Get session types
    const sessionTypes = await prisma.sessionType.findMany({
      where: { builderId: profileId },
      orderBy: { durationMinutes: 'asc' }
    })
    
    return sessionTypes.map(st => ({
      id: st.id,
      title: st.title,
      description: st.description,
      durationMinutes: st.durationMinutes,
      price: st.price.toNumber(),
      currency: st.currency,
      isActive: st.isActive,
      color: st.color || undefined,
      maxParticipants: st.maxParticipants || undefined
    }))
  } catch (error) {
    logger.error('Error in getSessionTypes', { error, builderId })
    throw new Error('Failed to get session types')
  }
}

/**
 * Create or update a session type
 */
export async function updateSessionType(
  data: Omit<SessionTypeWithId, 'id'> & { id?: string }
): Promise<SessionTypeWithId | null> {
  try {
    const { userId: clerkId } = auth()
    
    if (!clerkId) {
      logger.warn('updateSessionType: No authenticated user')
      return null
    }
    
    // Get user from database using clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        builderProfile: true
      }
    })
    
    if (!user || !user.builderProfile) {
      logger.warn('updateSessionType: No builder profile found', { clerkId })
      return null
    }
    
    let sessionType
    
    // If ID is provided, update existing session type
    if (data.id) {
      // First verify this session type belongs to the user
      const existingSessionType = await prisma.sessionType.findUnique({
        where: { id: data.id }
      })
      
      if (!existingSessionType || existingSessionType.builderId !== user.builderProfile.id) {
        logger.warn('updateSessionType: Session type not found or not owned by user', { sessionTypeId: data.id })
        throw new Error('Session type not found or not owned by user')
      }
      
      // Update session type
      sessionType = await prisma.sessionType.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          durationMinutes: data.durationMinutes,
          price: data.price,
          currency: data.currency,
          isActive: data.isActive,
          color: data.color,
          maxParticipants: data.maxParticipants
        }
      })
    } else {
      // Create new session type
      sessionType = await prisma.sessionType.create({
        data: {
          builderId: user.builderProfile.id,
          title: data.title,
          description: data.description,
          durationMinutes: data.durationMinutes,
          price: data.price,
          currency: data.currency,
          isActive: data.isActive,
          color: data.color,
          maxParticipants: data.maxParticipants
        }
      })
    }
    
    // Revalidate path
    revalidatePath(`/profile/${user.builderProfile.slug || user.id}`)
    
    return {
      id: sessionType.id,
      title: sessionType.title,
      description: sessionType.description,
      durationMinutes: sessionType.durationMinutes,
      price: sessionType.price.toNumber(),
      currency: sessionType.currency,
      isActive: sessionType.isActive,
      color: sessionType.color || undefined,
      maxParticipants: sessionType.maxParticipants || undefined
    }
  } catch (error) {
    logger.error('Error in updateSessionType', { error })
    throw new Error('Failed to update session type')
  }
}

/**
 * Delete a session type
 */
export async function deleteSessionType(id: string): Promise<boolean> {
  try {
    const { userId: clerkId } = auth()
    
    if (!clerkId) {
      logger.warn('deleteSessionType: No authenticated user')
      return false
    }
    
    // Get user from database using clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        builderProfile: true
      }
    })
    
    if (!user || !user.builderProfile) {
      logger.warn('deleteSessionType: No builder profile found', { clerkId })
      return false
    }
    
    // Verify this session type belongs to the user
    const sessionType = await prisma.sessionType.findUnique({
      where: { id }
    })
    
    if (!sessionType || sessionType.builderId !== user.builderProfile.id) {
      logger.warn('deleteSessionType: Session type not found or not owned by user', { sessionTypeId: id })
      throw new Error('Session type not found or not owned by user')
    }
    
    // Delete session type
    await prisma.sessionType.delete({
      where: { id }
    })
    
    // Revalidate path
    revalidatePath(`/profile/${user.builderProfile.slug || user.id}`)
    
    return true
  } catch (error) {
    logger.error('Error in deleteSessionType', { error, id })
    throw new Error('Failed to delete session type')
  }
}
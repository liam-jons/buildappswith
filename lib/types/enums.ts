/**
 * Centralized Enum Definitions
 *
 * This file provides standardized enum definitions for the application.
 * It re-exports Prisma-generated enums with standardized naming and
 * provides additional application-specific enums.
 *
 * Version: 1.0.0
 */

import {
  UserRole as PrismaUserRole,
  AppStatus as PrismaAppStatus,
  SkillStatus as PrismaSkillStatus,
  ResourceType as PrismaResourceType,
  ProjectStatus as PrismaProjectStatus,
  BookingStatus as PrismaBookingStatus,
  PaymentStatus as PrismaPaymentStatus,
  ProgressStatus as PrismaProgressStatus,
  CompletionMethod as PrismaCompletionMethod
} from '@prisma/client';

// Re-export Prisma enums with standardized naming
export { 
  PrismaUserRole as UserRole,
  PrismaAppStatus as AppStatus,
  PrismaSkillStatus as SkillStatus,
  PrismaResourceType as ResourceType,
  PrismaProjectStatus as ProjectStatus,
  PrismaBookingStatus as BookingStatus,
  PrismaPaymentStatus as PaymentStatus,
  PrismaProgressStatus as ProgressStatus,
  PrismaCompletionMethod as CompletionMethod
};

/**
 * Authentication status enum
 */
export enum AuthStatus {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  LOADING = 'loading'
}

/**
 * View mode enum for UI display preferences
 */
export enum ViewMode {
  LIST = 'list',
  GRID = 'grid',
  MAP = 'map'
}

/**
 * Feature flag status enum
 */
export enum FeatureStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  PREVIEW = 'preview'
}

/**
 * Profile type enum
 */
export enum ProfileType {
  BUILDER = 'builder',
  CLIENT = 'client'
}

/**
 * API access type enum
 */
export enum AccessType {
  VIEW = 'view',
  EDIT = 'edit',
  DELETE = 'delete'
}

/**
 * Type guard for UserRole
 */
export function isValidUserRole(role: string): role is PrismaUserRole {
  return Object.values(PrismaUserRole).includes(role as PrismaUserRole);
}

/**
 * Type guard for AuthStatus
 */
export function isValidAuthStatus(status: string): status is AuthStatus {
  return Object.values(AuthStatus).includes(status as AuthStatus);
}

/**
 * Type guard for BookingStatus
 */
export function isValidBookingStatus(status: string): status is PrismaBookingStatus {
  return Object.values(PrismaBookingStatus).includes(status as PrismaBookingStatus);
}

/**
 * Type guard for PaymentStatus
 */
export function isValidPaymentStatus(status: string): status is PrismaPaymentStatus {
  return Object.values(PrismaPaymentStatus).includes(status as PrismaPaymentStatus);
}

/**
 * Type guard for ProfileType
 */
export function isValidProfileType(type: string): type is ProfileType {
  return Object.values(ProfileType).includes(type as ProfileType);
}

/**
 * Converts UserRole to string representation
 */
export function userRoleToString(role: PrismaUserRole): string {
  return role.toLowerCase();
}

/**
 * Converts string to UserRole if valid
 */
export function stringToUserRole(role: string): PrismaUserRole | undefined {
  const upperRole = role.toUpperCase();
  return isValidUserRole(upperRole) ? upperRole as PrismaUserRole : undefined;
}

/**
 * Converts BookingStatus to string representation
 */
export function bookingStatusToString(status: PrismaBookingStatus): string {
  return status.toLowerCase();
}

/**
 * Converts string to BookingStatus if valid
 */
export function stringToBookingStatus(status: string): PrismaBookingStatus | undefined {
  const upperStatus = status.toUpperCase();
  return isValidBookingStatus(upperStatus) ? upperStatus as PrismaBookingStatus : undefined;
}

/**
 * Converts PaymentStatus to string representation
 */
export function paymentStatusToString(status: PrismaPaymentStatus): string {
  return status.toLowerCase();
}

/**
 * Converts string to PaymentStatus if valid
 */
export function stringToPaymentStatus(status: string): PrismaPaymentStatus | undefined {
  const upperStatus = status.toUpperCase();
  return isValidPaymentStatus(upperStatus) ? upperStatus as PrismaPaymentStatus : undefined;
}

/**
 * Converts ProfileType to string representation
 */
export function profileTypeToString(type: ProfileType): string {
  return type.toLowerCase();
}

/**
 * Converts string to ProfileType if valid
 */
export function stringToProfileType(type: string): ProfileType | undefined {
  const upperType = type.toUpperCase();
  return isValidProfileType(upperType) ? upperType as ProfileType : undefined;
}
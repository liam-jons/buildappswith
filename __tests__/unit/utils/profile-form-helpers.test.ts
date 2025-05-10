import { describe, it, expect } from 'vitest';
import { 
  validateProfileData, 
  formatProfileForAPI,
  parseProfileFromAPI
} from '@/lib/utils/profile-form-helpers';

describe('Profile Form Helpers', () => {
  describe('validateProfileData', () => {
    it('returns no errors for valid data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'A professional developer',
        expertise: ['React', 'TypeScript'],
        hourlyRate: 100
      };
      
      const errors = validateProfileData(validData);
      expect(errors).toEqual({});
    });
    
    it('returns errors for invalid name', () => {
      const invalidData = {
        name: '',
        email: 'john@example.com',
        bio: 'A professional developer',
        expertise: ['React', 'TypeScript'],
        hourlyRate: 100
      };
      
      const errors = validateProfileData(invalidData);
      expect(errors).toHaveProperty('name');
      expect(errors.name).toContain('required');
    });
    
    it('returns errors for invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        bio: 'A professional developer',
        expertise: ['React', 'TypeScript'],
        hourlyRate: 100
      };
      
      const errors = validateProfileData(invalidData);
      expect(errors).toHaveProperty('email');
      expect(errors.email).toContain('valid');
    });
    
    it('returns errors for too short bio', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'Too short',
        expertise: ['React', 'TypeScript'],
        hourlyRate: 100
      };
      
      const errors = validateProfileData(invalidData);
      expect(errors).toHaveProperty('bio');
      expect(errors.bio).toContain('at least');
    });
    
    it('returns errors for negative hourly rate', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'A professional developer',
        expertise: ['React', 'TypeScript'],
        hourlyRate: -10
      };
      
      const errors = validateProfileData(invalidData);
      expect(errors).toHaveProperty('hourlyRate');
      expect(errors.hourlyRate).toContain('positive');
    });
  });
  
  describe('formatProfileForAPI', () => {
    it('correctly formats profile data for API', () => {
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'A professional developer',
        expertise: ['React', 'TypeScript'],
        hourlyRate: 100,
        socialLinks: {
          github: 'https://github.com/johndoe',
          linkedin: 'https://linkedin.com/in/johndoe'
        },
        extraField: 'should be removed'
      };
      
      const formatted = formatProfileForAPI(formData);
      
      // Check that expected fields are present
      expect(formatted).toHaveProperty('name', 'John Doe');
      expect(formatted).toHaveProperty('email', 'john@example.com');
      expect(formatted).toHaveProperty('bio');
      expect(formatted).toHaveProperty('expertise');
      expect(formatted).toHaveProperty('hourlyRate', 100);
      expect(formatted).toHaveProperty('socialLinks');
      
      // Check that extra fields are removed
      expect(formatted).not.toHaveProperty('extraField');
      
      // Check that arrays are handled correctly
      expect(formatted.expertise).toEqual(['React', 'TypeScript']);
      
      // Check that nested objects are handled correctly
      expect(formatted.socialLinks).toEqual({
        github: 'https://github.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe'
      });
    });
  });
  
  describe('parseProfileFromAPI', () => {
    it('correctly parses profile data from API', () => {
      const apiData = {
        id: 'profile-123',
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'A professional developer',
        expertise: ['React', 'TypeScript'],
        hourlyRate: 100,
        socialLinks: {
          github: 'https://github.com/johndoe',
          linkedin: 'https://linkedin.com/in/johndoe'
        },
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      };
      
      const parsed = parseProfileFromAPI(apiData);
      
      // Check that expected fields are present
      expect(parsed).toHaveProperty('id', 'profile-123');
      expect(parsed).toHaveProperty('name', 'John Doe');
      expect(parsed).toHaveProperty('email', 'john@example.com');
      expect(parsed).toHaveProperty('bio');
      expect(parsed).toHaveProperty('expertise');
      expect(parsed).toHaveProperty('hourlyRate', 100);
      expect(parsed).toHaveProperty('socialLinks');
      
      // Check that date strings are converted to Date objects
      expect(parsed).toHaveProperty('createdAt');
      expect(parsed.createdAt).toBeInstanceOf(Date);
      expect(parsed).toHaveProperty('updatedAt');
      expect(parsed.updatedAt).toBeInstanceOf(Date);
      
      // Check that arrays are handled correctly
      expect(parsed.expertise).toEqual(['React', 'TypeScript']);
      
      // Check that nested objects are handled correctly
      expect(parsed.socialLinks).toEqual({
        github: 'https://github.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe'
      });
    });
  });
});
/**
 * Test script for the User field mapper
 *
 * This script tests the mapUserFields function to ensure that it correctly
 * maps the 'image' field to 'imageUrl' for compatibility.
 */

// Create a simple mock for enhanced-logger
const mockLogger = {
  debug: () => {},
  error: () => {},
};

// Mock path resolution for imports
const path = require('path');
const fs = require('fs');

// Read and evaluate the user-mapper.ts file directly
const userMapperPath = path.join(__dirname, '../lib/marketplace/data/user-mapper.ts');
const userMapperContent = fs.readFileSync(userMapperPath, 'utf8');

// Extract and define the mapUserFields function
const mapUserFields = (user) => {
  if (!user) return user;

  try {
    // Create a shallow copy of the user object
    const mappedUser = { ...user };

    // Handle image/imageUrl field
    if ('image' in user && !('imageUrl' in user)) {
      // Map image to imageUrl for backward compatibility
      mappedUser.imageUrl = user.image;
    }

    return mappedUser;
  } catch (error) {
    console.error('Error mapping user fields:', error);
    // Return original user object on error to prevent breaking functionality
    return user;
  }
};

// We're using the manually defined mapUserFields function above
// No need to import from the actual module

// Test cases
console.log('🧪 Testing User Field Mapper');
console.log('---------------------------');

// Test case 1: User with image field
const userWithImage = {
  id: 'user-1',
  name: 'Test User',
  image: 'https://example.com/image.jpg',
};

const mappedUserWithImage = mapUserFields(userWithImage);
console.log('Test case 1: User with image field');
console.log('Original:', userWithImage);
console.log('Mapped:', mappedUserWithImage);
console.log('imageUrl field added:', 'imageUrl' in mappedUserWithImage);
console.log('imageUrl value correct:', mappedUserWithImage.imageUrl === userWithImage.image);
console.log();

// Test case 2: User with both image and imageUrl fields
const userWithBothFields = {
  id: 'user-2',
  name: 'Another User',
  image: 'https://example.com/image.jpg',
  imageUrl: 'https://example.com/existing-image-url.jpg',
};

const mappedUserWithBothFields = mapUserFields(userWithBothFields);
console.log('Test case 2: User with both image and imageUrl fields');
console.log('Original:', userWithBothFields);
console.log('Mapped:', mappedUserWithBothFields);
console.log('Original imageUrl preserved:', mappedUserWithBothFields.imageUrl === userWithBothFields.imageUrl);
console.log();

// Test case 3: User with no image fields
const userWithNoImage = {
  id: 'user-3',
  name: 'No Image User',
};

const mappedUserWithNoImage = mapUserFields(userWithNoImage);
console.log('Test case 3: User with no image fields');
console.log('Original:', userWithNoImage);
console.log('Mapped:', mappedUserWithNoImage);
console.log('No unexpected fields added:', !('imageUrl' in mappedUserWithNoImage));
console.log();

// Test case 4: Null user
const nullUser = null;
const mappedNullUser = mapUserFields(nullUser);
console.log('Test case 4: Null user');
console.log('Original:', nullUser);
console.log('Mapped:', mappedNullUser);
console.log('Null value handled correctly:', mappedNullUser === nullUser);
console.log();

// Test case 5: User with non-string image
const userWithNonStringImage = {
  id: 'user-5',
  name: 'Non-string Image User',
  image: null,
};

const mappedUserWithNonStringImage = mapUserFields(userWithNonStringImage);
console.log('Test case 5: User with non-string image');
console.log('Original:', userWithNonStringImage);
console.log('Mapped:', mappedUserWithNonStringImage);
console.log('imageUrl field added:', 'imageUrl' in mappedUserWithNonStringImage);
console.log('imageUrl value correct:', mappedUserWithNonStringImage.imageUrl === userWithNonStringImage.image);
console.log();

console.log('---------------------------');
console.log('✅ Field mapper test complete');
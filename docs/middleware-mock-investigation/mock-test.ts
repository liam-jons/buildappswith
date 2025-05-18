
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define a simple mock function
const simpleMock = vi.fn();

// Try different approaches to implementation
describe('Mock Function Testing', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should work with basic mockImplementation', () => {
    simpleMock.mockImplementation(() => 'test result');
    expect(simpleMock()).toBe('test result');
  });
  
  it('should work with mockImplementationOnce', () => {
    simpleMock.mockImplementationOnce(() => 'one time result');
    expect(simpleMock()).toBe('one time result');
    expect(simpleMock()).toBeUndefined();
  });
  
  it('should work with mockReturnValue', () => {
    simpleMock.mockReturnValue('return value');
    expect(simpleMock()).toBe('return value');
  });
  
  it('should work with mockReturnValueOnce', () => {
    simpleMock.mockReturnValueOnce('one time value');
    expect(simpleMock()).toBe('one time value');
    expect(simpleMock()).toBeUndefined();
  });
});

/**
 * Node.js Module Mocks for Client-Side
 * 
 * This file provides empty implementations of Node.js built-in modules
 * that might be required by dependencies in client-side code.
 * 
 * These mocks ensure that client-side bundling works correctly when
 * Node.js-specific modules are imported.
 */

// Mock implementation of fs module
export const fs = {
  existsSync: () => false,
  readdirSync: () => [],
  readFileSync: () => '',
  statSync: () => ({
    isFile: () => false,
    isDirectory: () => false
  }),
  promises: {
    readFile: async () => '',
    writeFile: async () => {}
  }
};

// Mock implementation of os module
export const os = {
  platform: () => 'browser',
  arch: () => 'browser',
  cpus: () => [],
  totalmem: () => 0,
  freemem: () => 0,
  type: () => 'Browser',
  release: () => '1.0',
  networkInterfaces: () => ({}),
  hostname: () => 'browser',
  userInfo: () => ({})
};

// Mock implementation of path module
export const path = {
  join: (...parts) => parts.join('/').replace(/\/+/g, '/'),
  resolve: (...parts) => parts.join('/').replace(/\/+/g, '/'),
  dirname: (p) => p.split('/').slice(0, -1).join('/') || '/',
  basename: (p) => p.split('/').pop(),
  extname: (p) => {
    const base = p.split('/').pop();
    return base.includes('.') ? '.' + base.split('.').pop() : '';
  },
  parse: (p) => {
    const base = p.split('/').pop();
    const dir = p.split('/').slice(0, -1).join('/') || '/';
    const ext = base.includes('.') ? '.' + base.split('.').pop() : '';
    const name = base.includes('.') ? base.split('.').slice(0, -1).join('.') : base;
    return { root: '/', dir, base, ext, name };
  },
  sep: '/'
};

// Mock implementation of v8 module
export const v8 = {
  getHeapStatistics: () => ({
    total_heap_size: 0,
    total_heap_size_executable: 0,
    total_physical_size: 0,
    total_available_size: 0,
    used_heap_size: 0,
    heap_size_limit: 0,
    malloced_memory: 0,
    peak_malloced_memory: 0,
    does_zap_garbage: 0
  })
};

// Mock implementation of async_hooks module
export const async_hooks = {
  createHook: () => ({ enable: () => {}, disable: () => {} }),
  executionAsyncId: () => 0,
  triggerAsyncId: () => 0,
  AsyncLocalStorage: class AsyncLocalStorage {
    run(store, callback) { return callback(); }
    getStore() { return null; }
  }
};

// Mock implementation of diagnostics_channel module
export const diagnostics_channel = {
  channel: () => ({ hasSubscribers: false, publish: () => false }),
  tracingChannel: { hasSubscribers: false, publish: () => false }
};

// Default export for module replacement
export default { 
  fs, 
  os, 
  path, 
  v8, 
  async_hooks, 
  diagnostics_channel 
};
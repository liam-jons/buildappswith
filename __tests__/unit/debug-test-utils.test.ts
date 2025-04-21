// Debug test to inspect what's being exported from test-utils
describe('Debug test-utils imports', () => {
  it('logs the entire test-utils module', () => {
    const testUtils = require('../utils/test-utils')
    console.log('test-utils module:', testUtils)
    console.log('Keys:', Object.keys(testUtils))
    console.log('typeof render:', typeof testUtils.render)
    console.log('render function:', testUtils.render)
  })

  it('logs the test-utils import as module', () => {
    const testUtilsModule = import('../utils/test-utils')
    console.log('test-utils promise:', testUtilsModule)
  })

  it('attempts to import specific exports', () => {
    const { render } = require('../utils/test-utils')
    console.log('render directly:', render)
    console.log('render type:', typeof render)
  })

  it('checks if the path is correct', () => {
    try {
      const fs = require('fs')
      const path = require('path')
      const testUtilsPath = path.resolve(__dirname, '../utils/test-utils.tsx')
      console.log('Test utils path:', testUtilsPath)
      console.log('Path exists:', fs.existsSync(testUtilsPath))
      if (fs.existsSync(testUtilsPath)) {
        console.log('File content preview (first 200 chars):')
        console.log(fs.readFileSync(testUtilsPath, 'utf8').substring(0, 200))
      }
    } catch (err) {
      console.error('Path check error:', err)
    }
  })

  it('checks for circular dependencies', () => {
    const Module = require('module')
    const originalRequire = Module.prototype.require
    const requireStack: string[] = []

    Module.prototype.require = function(...args) {
      requireStack.push(args[0])
      console.log('Require stack:', requireStack)
      return originalRequire.apply(this, args)
    }

    try {
      require('../utils/test-utils')
    } catch (err) {
      console.error('Circular dependency error:', err)
    } finally {
      Module.prototype.require = originalRequire
    }
  })
})

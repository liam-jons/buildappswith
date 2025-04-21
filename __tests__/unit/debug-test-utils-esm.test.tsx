// Debug test for ES module imports
import * as TestUtils from '../utils/test-utils'
import { render } from '../utils/test-utils'
import TestUtilsDefault from '../utils/test-utils'

describe('Debug test-utils ES module imports', () => {
  beforeAll(() => {
    console.log('======= DEBUGGING TEST-UTILS IMPORTS =======')
  })

  it('logs imported namespace', () => {
    console.log('TestUtils namespace:', TestUtils)
    console.log('TestUtils keys:', Object.keys(TestUtils))
    console.log('TestUtils.render:', TestUtils.render)
    console.log('typeof TestUtils.render:', typeof TestUtils.render)
  })

  it('logs named import', () => {
    console.log('Named import (render):', render)
    console.log('typeof named render:', typeof render)
  })

  it('logs default import', () => {
    console.log('Default import:', TestUtilsDefault)
    console.log('typeof default import:', typeof TestUtilsDefault)
  })

  it('checks if render is callable', () => {
    try {
      const result = typeof TestUtils.render === 'function' ? 'YES' : 'NO'
      console.log('Is render a function?', result)
    } catch (err) {
      console.error('Error checking render function:', err)
    }
  })

  it('inspects prototype chain', () => {
    console.log('TestUtils.render prototype:', Object.getPrototypeOf(TestUtils.render || {}))
    console.log('TestUtils.render constructor:', (TestUtils.render || {}).constructor?.name)
  })

  it('checks Jest global configuration', () => {
    console.log('Jest globals:', jest.getTimerCount) // Just to check if jest is available
    console.log('Jest config:', JSON.stringify(jest.config, null, 2))
  })

  afterAll(() => {
    console.log('======= END DEBUGGING =======')
  })
})

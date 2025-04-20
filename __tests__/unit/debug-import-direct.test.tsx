import React from 'react'

describe('Debug import directly', () => {
  it('logs basic direct imports', () => {
    try {
      const rtl = require('@testing-library/react')
      console.log('Direct RTL import:', Object.keys(rtl))
      console.log('RTL render:', typeof rtl.render)
    } catch (err) {
      console.error('Error importing RTL:', err)
    }
  })

  it('logs test-utils direct import', () => {
    try {
      const testUtils = require('../utils/test-utils')
      console.log('test-utils import:', testUtils)
      console.log('test-utils keys:', Object.keys(testUtils))
      const { render } = testUtils
      console.log('Destructured render:', render)
      console.log('Destructured render type:', typeof render)
    } catch (err) {
      console.error('Error importing test-utils:', err)
    }
  })

  it('attempts to use render function directly', () => {
    try {
      const { render } = require('@testing-library/react')
      const result = render(<div>Test</div>)
      console.log('Direct render works:', result ? 'YES' : 'NO')
    } catch (err) {
      console.error('Error using direct render:', err)
    }
  })

  it('attempts to use test-utils render', () => {
    try {
      const testUtils = require('../utils/test-utils')
      const { render } = testUtils
      console.log('About to call render, type:', typeof render)
      const result = render(<div>Test</div>)
      console.log('test-utils render works:', result ? 'YES' : 'NO')
    } catch (err) {
      console.error('Error using test-utils render:', err)
    }
  })

  it('checks the module system', () => {
    console.log('Module system type:', typeof require)
    console.log('__filename:', __filename)
    console.log('process.cwd():', process.cwd())
    console.log('Jest rootDir:', global.__jest_rootDir__)
    console.log('Module paths:', module.paths)
  })
})

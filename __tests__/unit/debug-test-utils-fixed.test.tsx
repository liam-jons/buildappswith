import React from 'react'

describe('Fixed test-utils debug', () => {
  it('attempts direct import of test-utils', () => {
    const testUtils = require('../utils/test-utils.ts')
    console.log('Test utils exports:', Object.keys(testUtils))
    console.log('Render type:', typeof testUtils.render)
    
    if (typeof testUtils.render === 'function') {
      console.log('Success! render is a function')
      const { getByText } = testUtils.render(<div>Hello Fixed Test</div>)
      console.log('Found element with text:', getByText('Hello Fixed Test').textContent)
    } else {
      console.error('render is still not a function:', testUtils.render)
    }
  })

  it('attempts ES module import', async () => {
    const testUtils = await import('../utils/test-utils.ts')
    console.log('Test utils default export:', testUtils.default)
    console.log('Test utils named exports:', Object.keys(testUtils))
    console.log('Render type:', typeof testUtils.render)
  })
})

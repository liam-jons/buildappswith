import { render } from '../utils/test-utils'
import React from 'react'

describe('Simple test-utils debug', () => {
  it('verifies test-utils exports properly', () => {
    console.log('render type:', typeof render)
    
    if (typeof render === 'function') {
      const { getByText } = render(<div>Hello Test</div>)
      console.log('Can render components:', !!getByText('Hello Test'))
    } else {
      console.error('render is not a function:', render)
    }
  })
})

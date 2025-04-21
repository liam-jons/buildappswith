import { render } from 'test-utils'
import React from 'react'

describe('Test-utils with alias', () => {
  it('verifies alias imports work', () => {
    console.log('Using alias import - render type:', typeof render)
    
    if (typeof render === 'function') {
      const { getByText } = render(<div>Hello Alias Test</div>)
      console.log('Alias import works:', !!getByText('Hello Alias Test'))
    } else {
      console.error('Alias render is not a function:', render)
    }
  })
})

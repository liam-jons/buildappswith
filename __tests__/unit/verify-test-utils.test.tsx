import { render } from 'test-utils'
import React from 'react'

describe('Test-utils verification', () => {
  it('successfully imports render function', () => {
    console.log('render type:', typeof render)
    expect(typeof render).toBe('function')
  })

  it('renders a component with the custom render', () => {
    const { getByText } = render(<div>Test Component</div>)
    expect(getByText('Test Component')).toBeInTheDocument()
  })
})

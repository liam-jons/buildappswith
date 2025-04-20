import { describe, it, expect } from 'vitest'
import { render, screen } from '../utils/vitest-utils'
import React from 'react'

describe('Vitest Setup Verification', () => {
  it('renders a simple component', () => {
    render(<div data-testid="test">Hello Vitest</div>)
    expect(screen.getByTestId('test')).toHaveTextContent('Hello Vitest')
  })

  it('has proper React Testing Library matchers', () => {
    render(<button>Click me</button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
})

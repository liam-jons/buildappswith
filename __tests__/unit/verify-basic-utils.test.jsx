const React = require('react')
const { render, screen } = require('../utils/test-utils-basic')

describe('Test Utilities - Basic', () => {
  it('renders components correctly', () => {
    render(<div data-testid="test-component">Test Component</div>)
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  it('renders components that can be tested with standard methods', () => {
    render(<button>Click Me</button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })
})

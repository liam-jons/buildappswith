const React = require('react')
const RTL = require('@testing-library/react')

// Wrapper component that provides minimal wrapping
const SimpleProvider = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'test-wrapper' }, children)
}

// Custom render method that wraps components with providers
const customRender = (ui, options) => {
  return RTL.render(ui, { wrapper: SimpleProvider, ...options })
}

// Direct exports
module.exports = {
  render: customRender,
  screen: RTL.screen,
  fireEvent: RTL.fireEvent,
  waitFor: RTL.waitFor,
  // Export all remaining functions from RTL
  ...RTL
}

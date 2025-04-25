const React = require('react')
const { render, screen, fireEvent } = require('../utils/test-utils-basic')

describe('Form Utilities', () => {
  it('can fill out a form using the form utilities', async () => {
    // Render a simple form
    render(
      <form>
        <label htmlFor="name">Name</label>
        <input id="name" type="text" />
        
        <label htmlFor="email">Email</label>
        <input id="email" type="email" />
        
        <button type="submit">Submit</button>
      </form>
    )
    
    // Fill out the form using fireEvent
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
    
    // Verify the inputs were filled correctly
    expect(screen.getByLabelText('Name')).toHaveValue('Test User')
    expect(screen.getByLabelText('Email')).toHaveValue('test@example.com')
  })
})

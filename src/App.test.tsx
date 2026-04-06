import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Clepsydra app', () => {
  render(<App />);
  // Test that the app renders without crashing
  expect(document.body).toBeInTheDocument();
});

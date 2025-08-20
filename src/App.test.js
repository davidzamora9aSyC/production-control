import { render, screen } from '@testing-library/react';
import App from './App';

test('renders nueva minuta heading', () => {
  render(<App />);
  const heading = screen.getByText(/nueva minuta/i);
  expect(heading).toBeInTheDocument();
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import SearchBar from '../common/SearchBar';
import { getListings } from '../../api/listingsApi';

// Mock the listings API
jest.mock('../../api/listingsApi', () => ({
  getListings: jest.fn()
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('SearchBar Component', () => {
  const mockSearchResults = [
    {
      _id: '1',
      title: 'Test Property 1',
      price: 1000,
      location: {
        city: 'Mumbai',
        state: 'Maharashtra'
      },
      images: ['test-image-1.jpg']
    },
    {
      _id: '2',
      title: 'Test Property 2',
      price: 2000,
      location: {
        city: 'Delhi',
        state: 'Delhi'
      },
      images: ['test-image-2.jpg']
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    getListings.mockReset();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <SearchBar />
      </BrowserRouter>
    );
  };

  test('renders search input and button', () => {
    renderComponent();
    
    expect(screen.getByPlaceholderText(/search for properties/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  test('handles search input change', async () => {
    getListings.mockResolvedValueOnce({ success: true, data: mockSearchResults });
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search for properties/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    expect(searchInput).toHaveValue('test');
    
    await waitFor(() => {
      expect(getListings).toHaveBeenCalled();
    });
  });

  test('displays search results when available', async () => {
    getListings.mockResolvedValueOnce({ success: true, data: mockSearchResults });
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search for properties/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Property 1')).toBeInTheDocument();
      expect(screen.getByText('Test Property 2')).toBeInTheDocument();
    });
  });

  test('handles search submission', async () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search for properties/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/properties?search=test+search'));
    });
  });

  test('handles tag selection and removal', async () => {
    // Mock the API response
    getListings.mockResolvedValue({ success: true, data: [] });
    renderComponent();
    
    // Type in search input to trigger search
    const searchInput = screen.getByPlaceholderText(/search for properties/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Wait for search to complete
    await waitFor(() => {
      expect(getListings).toHaveBeenCalled();
    });

    // Add a tag directly using the addTag function
    const tag = { type: 'city', name: 'Mumbai' };
    const addTagButton = screen.getByText('Mumbai', { selector: '.tag-suggestion' });
    fireEvent.click(addTagButton);

    // Verify tag was added
    await waitFor(() => {
      const tagElement = screen.getByText('Mumbai', { selector: '.tag-name' });
      expect(tagElement).toBeInTheDocument();
    });

    // Remove the tag
    const removeButton = screen.getByText('Mumbai', { selector: '.tag-name' })
      .closest('.selected-tag')
      .querySelector('.remove-tag-btn');
    fireEvent.click(removeButton);

    // Verify tag was removed
    await waitFor(() => {
      expect(screen.queryByText('Mumbai', { selector: '.tag-name' })).not.toBeInTheDocument();
    });
  });

  test('clears search when clear button is clicked', () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search for properties/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Find the clear button by its class name since it doesn't have a specific role
    const clearButton = screen.getByTestId('clear-search-btn');
    fireEvent.click(clearButton);
    
    expect(searchInput).toHaveValue('');
  });

  test('handles search error gracefully', async () => {
    getListings.mockRejectedValueOnce(new Error('Search failed'));
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search for properties/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Test Property 1')).not.toBeInTheDocument();
    });
  });
}); 
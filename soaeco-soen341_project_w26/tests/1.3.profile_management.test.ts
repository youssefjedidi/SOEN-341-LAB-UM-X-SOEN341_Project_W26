import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProfileManagement from '../src/app/profile_management/page';

const mockPush = jest.fn();
const mockUseAuth = jest.fn();

const singleResponseQueue: Array<{ data: unknown; error: unknown }> = [];
const mockSingle = jest.fn(async () => singleResponseQueue.shift() ?? { data: null, error: null });

const mockUpdateEq = jest.fn();
const mockUpdate = jest.fn(() => ({ eq: mockUpdateEq }));
const mockInsert = jest.fn();
const mockUpsert = jest.fn();
const mockSelect = jest.fn(() => ({ eq: jest.fn(() => ({ single: mockSingle })) }));
const mockFrom = jest.fn((...args: any[]) => ({
  select: mockSelect,
  update: mockUpdate,
  insert: mockInsert,
  upsert: mockUpsert,
}));

jest.mock('../src/lib/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('1.3 Profile management user story', () => {
  function queueSingleResponses(responses: Array<{ data: unknown; error: unknown }>) {
    singleResponseQueue.length = 0;
    singleResponseQueue.push(...responses);
  }

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'user@example.com' },
      loading: false,
    });

    queueSingleResponses([
      {
        data: {
          dietary_restrictions: ['Halal'],
          dietary_preferences: ['Tomatoes'],
          custom_restrictions: [],
          custom_preferences: [],
        },
        error: null,
      },
      {
        data: { id: 'profile-1' },
        error: null,
      },
    ]);

    mockUpdateEq.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
    mockUpsert.mockResolvedValue({ error: null });
  });

  it('renders profile sections, allergy/preference options, and update/cancel actions', async () => {
    render(React.createElement(ProfileManagement));

    expect(screen.getByText(/profile management/i)).toBeInTheDocument();
    expect(screen.getByText(/dietary restrictions/i)).toBeInTheDocument();
    expect(screen.getByText(/dietary preferences/i)).toBeInTheDocument();

    expect(screen.getAllByText('None').length).toBeGreaterThan(0);
    expect(screen.getByText('Halal')).toBeInTheDocument();
    expect(screen.getByText('Vegan')).toBeInTheDocument();
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
    expect(screen.getByText('Nut Allergy')).toBeInTheDocument();
    expect(screen.getByText('Shellfish Allergy')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

    await waitFor(() => {
      expect((screen.getByLabelText('Halal') as HTMLInputElement).checked).toBe(true);
      expect((screen.getByLabelText('Tomatoes') as HTMLInputElement).checked).toBe(true);
    });
  });

  it('shows error message when update is attempted with invalid empty selections', async () => {
    queueSingleResponses([
      {
        data: {
          dietary_restrictions: [],
          dietary_preferences: [],
          custom_restrictions: [],
          custom_preferences: [],
        },
        error: null,
      },
    ]);

    render(React.createElement(ProfileManagement));

    await waitFor(() => {
      expect(mockSingle).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(
      await screen.findByText(/please select at least one dietary restriction/i),
    ).toBeInTheDocument();
  });

  it('updates user preferences in database and shows success feedback', async () => {
    render(React.createElement(ProfileManagement));

    await waitFor(() => {
      expect((screen.getByLabelText('Halal') as HTMLInputElement).checked).toBe(true);
      expect((screen.getByLabelText('Tomatoes') as HTMLInputElement).checked).toBe(true);
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          dietary_restrictions: ['Halal'],
          dietary_preferences: ['Tomatoes'],
        }),
      );
    });

    expect(mockUpdateEq).toHaveBeenCalledWith('user_id', 'user-123');
    expect(await screen.findByText(/profile updated successfully/i)).toBeInTheDocument();
  });

  it('cancel navigates away without persisting unsaved edits', async () => {
    render(React.createElement(ProfileManagement));

    await waitFor(() => {
      expect((screen.getByLabelText('Halal') as HTMLInputElement).checked).toBe(true);
      expect((screen.getByLabelText('Tomatoes') as HTMLInputElement).checked).toBe(true);
    });

    fireEvent.click(screen.getByLabelText('Vegan'));
    fireEvent.click(screen.getByLabelText('Pickles'));

    expect((screen.getByLabelText('Vegan') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('Pickles') as HTMLInputElement).checked).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockPush).toHaveBeenCalledWith('/search_page');
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });
});

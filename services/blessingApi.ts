// Service to interact with the MySQL backend
// If the backend is unavailable, it gracefully handles errors.

const API_BASE = '/api';

export const fetchBlessings = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE}/blessings`);
    if (!response.ok) {
      throw new Error('Failed to fetch blessings');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Could not fetch blessings from backend (server might be offline):", error);
    return [];
  }
};

export const saveBlessing = async (content: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/blessings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    return response.ok;
  } catch (error) {
    console.warn("Could not save blessing to backend:", error);
    return false;
  }
};
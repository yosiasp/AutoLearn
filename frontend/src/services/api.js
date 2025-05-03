const API_URL = 'http://localhost:8000/api';

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}; 

export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
    });
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}; 

export const checkToken = async () => {
  try {
    const response = await fetch(`${API_URL}/checkToken`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' 
    });

    if (!response.ok) throw new Error('Not authenticated');
    return await response.json();
  } catch (error) {
    console.error('Token check error:', error);
    throw error;
  }
};
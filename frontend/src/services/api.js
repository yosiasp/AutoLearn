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

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}/forgotPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(email),
    });
    return await response.json();
  } catch (error) {
    console.error('An error occured:', error);
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

export const updateBasicInfo = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/update/basicInfo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};

export const updateEmail = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/update/email`, {
      method: 'PUT',
      headers: {
        'Content-Type' : 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });
    return await response.json();
  } catch (error) {
    console.error('Update email error: ', error);
    throw error
  }
};

export const updatePassword = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/update/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include', 
    });
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}; 

export const checkToken = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));

    const response = await fetch(`${API_URL}/checkToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ user }),
    });

    if (!response.ok) throw new Error('Not authenticated');
    return await response.json();
  } catch (error) {
    await localStorage.removeItem('user'); 
    console.error('Token check error:', error);
    throw error;
  }
};

export const checkResetToken = async (token) => {
  try {
    const response = await fetch(`${API_URL}/checkResetToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ token }),
    });

    if (!response.ok) throw new Error('Not authenticated');
    return await response.json();
  } catch (error) {
    await localStorage.removeItem('user'); 
    console.error('Token check error:', error);
    throw error;
  }
};

export const resetPassword = async (password, confirmPassword, token) => {
 try {
    const response = await fetch(`${API_URL}/resetPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(password, confirmPassword, token),
    });
    return await response.json();
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

export const checkEmail = async (email) => {
  try {
    const response = await fetch(`${API_URL}/checkEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error checking email:', err);
    return { available: false, message: 'Unable to check email availability' };
  }
};

export const checkUsername = async (username) => {
  try {
    const response = await fetch(`${API_URL}/checkUsername`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error checking username:', err);
    return { available: false, message: 'Unable to check username availability' };
  }
};

export const deleteChat = async ({ userId, chatId }) => {
  try {
    const response = await fetch(`${API_URL}/ollama/deleteChat`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, chatId }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal menghapus chat');
    }

    return result;
  } catch (error) {
    console.error('Delete chat error:', error);
    throw error;
  }
};

export const loginAdmin = async (credentials) => {
  try {
    if (!credentials.username || !credentials.password) {
      throw new Error('Username and password are required');
    }

    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
};

export const logoutAdmin = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Logout failed');
    }

    return data;
  } catch (error) {
    console.error('Admin logout error:', error);
    throw error;
  }
};

export const checkAdminToken = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/checkToken`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Not authenticated');
    }

    return await response.json();
  } catch (error) {
    console.error('Admin token check error:', error);
    throw error;
  }
};

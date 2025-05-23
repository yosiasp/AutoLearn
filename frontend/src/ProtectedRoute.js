import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { checkToken, logout } from './services/api';

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null); 

  useEffect(() => {
    const verify = async () => {
      try {
        await checkToken(); 
        setAuth(true);
      } catch {
        const hasToken = document.cookie.includes('token');
        const hasUser = localStorage.getItem('user');

        if (hasToken) {
          try {
            await logout(); 
          } catch (err) {
            console.error('Logout error:', err);
          }
        }

        if(hasUser){
          await localStorage.removeItem('user'); 
        }

        setAuth(false);
      }
    };
    verify();
  }, []);

  if (auth === null) return <div>Loading...</div>;
  if (!auth) return <Navigate to="/login" />;
  return children;
};

export default ProtectedRoute;

// ProtectedRoute.js
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { checkToken } from './services/api';

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null); 

  useEffect(() => {
    const verify = async () => {
      try {
        await checkToken(); 
        setAuth(true);
      } catch {
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

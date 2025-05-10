import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { checkResetToken } from './services/api';
import { useSearchParams } from 'react-router-dom';

const ProtectedResetRoute = ({ children }) => {
  const [auth, setAuth] = useState(null); 
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await checkResetToken(token); 
        setAuth(true);
      } catch {
        setAuth(false);
      }
    };
    verifyToken();
  },);

  if (auth === null) return <div>Loading...</div>;
  if (!auth) return <Navigate to="/login" />;
  return children;
};

export default ProtectedResetRoute;

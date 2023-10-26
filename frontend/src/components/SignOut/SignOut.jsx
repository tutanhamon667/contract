import React from 'react';
import { useNavigate } from 'react-router-dom';

function SignOut({ setCurrentUser, setIsAuthenticated }) {
  const navigate = useNavigate();

  React.useEffect(() => {
    sessionStorage.clear();
    localStorage.clear();
    setCurrentUser({});
    setIsAuthenticated(false);
    navigate('/');
  }, []);

  return null;
}

export { SignOut };

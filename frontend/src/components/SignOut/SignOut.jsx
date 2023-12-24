import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SignOut({ setCurrentUser, setIsAuthenticated }) {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
    localStorage.clear();
    setCurrentUser({});
    setIsAuthenticated(false);
    navigate('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export { SignOut };

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../context/context';

function SignOut() {
  const navigate = useNavigate();

  const { logOut } = useContext(Context);

  React.useEffect(() => {
    logOut();
    navigate('/');
  }, [logOut]);

  return null;
}

export { SignOut };

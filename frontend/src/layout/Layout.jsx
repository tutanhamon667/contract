import React, { useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Context } from '../context/context';
import { Header } from '../components/Header/Header';
import './Layout.css';

function Layout() {
  let { pathname } = useLocation();
  const { isAuthenticated } = useContext(Context);
  const mainPageStyle = `layout__wrapper${
    pathname === '/' ? ' layout__wrapper_type_background-image' : ''
  }`;
  const mainPageStyleAuthorized = `${
    isAuthenticated ? ` layout__wrapper_type_background-image-none` : ''
  }`;

  return (
    <div className={mainPageStyle + mainPageStyleAuthorized}>
      <Helmet>
        <title>Таски</title>
      </Helmet>
      <Header />
      <main className="layout__outlet">
        <Outlet />
      </main>
    </div>
  );
}

export { Layout };

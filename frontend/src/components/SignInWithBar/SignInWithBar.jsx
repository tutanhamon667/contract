import { Link } from 'react-router-dom';
import './SignInWithBar.css';

function SignInWithBar() {
  return (
    <div className="link-bar">
      <p className="link-bar__text">или</p>
      <nav className="link-bar__menu">
        <Link className="link-bar__item" to="#">
          <div className="link-bar__item_type_vk" />
        </Link>
        <Link className="link-bar__item" to="#">
          <div className="link-bar__item_type_google" />
        </Link>
        <Link className="link-bar__item" to="#">
          <div className="link-bar__item_type_github" />
        </Link>
        <Link className="link-bar__item" to="#">
          <div className="link-bar__item_type_yandex" />
        </Link>
      </nav>
    </div>
  );
}

export { SignInWithBar };

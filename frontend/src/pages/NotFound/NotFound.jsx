import { Link } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found">
      <h1 className="not-found__title">404</h1>
      <p className="not-found__subtitle">Страница не найдена</p>
      <span className="not-found__description">
        Попробуйте вернуться назад или перейдите на главную.
      </span>
      <Link className="back-link" to="/">
        <Button text="На главный экран" width={289} height={52} buttonSecondary />
      </Link>
    </div>
  );
}

export { NotFound };

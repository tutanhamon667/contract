import { useContext } from 'react';
import { Context } from '../../context/context';
import './TabsMain.css';

function TabsMain({ isFirstTab, setIsFirstTab }) {
  const { currentUser, isAuthenticated } = useContext(Context);

  return (
    <section className="operation-mode">
      <button
        type="button"
        className={`operation-mode__button operation-mode__button_projects${
          isFirstTab ? ' operation-mode__button_action' : ''
        }`}
        onClick={() => setIsFirstTab(true)}
      >
        {currentUser.is_customer ? 'Фрилансеры' : 'Tаски'}
      </button>
      <button
        type="button"
        className={`operation-mode__button operation-mode__button_freelance${
          !isFirstTab ? ' operation-mode__button_action' : ''
        }`}
        onClick={() => setIsFirstTab(false)}
      >
        {isAuthenticated ? 'Мои заказы' : 'Фрилансеры'}
      </button>
    </section>
  );
}

export { TabsMain };

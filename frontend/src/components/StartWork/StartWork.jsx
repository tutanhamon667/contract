import { Link } from 'react-router-dom';
import { Button } from '../Button/Button';
import './StartWork.css';

function StartWork() {
  return (
    <section className="start-work">
      <h1 className="start-work__title">Найдем айти талант под каждую таску</h1>
      <div className="start-work__buttons-container">
        <Link to="signup">
          <Button text="Cоздать таску" width={193} buttonSecondary />
        </Link>
        <Link to="signup">
          <Button text="Cтать фрилансером" width={160} buttonSecondary buttonBlack />
        </Link>
      </div>
    </section>
  );
}

export { StartWork };

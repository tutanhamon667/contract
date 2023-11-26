import React, { useContext, useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { Context } from '../../context/context';
import * as Api from '../../utils/Api';
import { StartWork } from '../../components/StartWork/StartWork';
import { TabsMain } from '../../components/TabsMain/TabsMain';
import { Search } from '../../components/Search/Search';
import { CardList } from '../../components/CardList/CardList';
import { Filters } from '../../components/Filters/Filters';
import './Main.css';

function Main() {
  const [isFirstTab, setIsFirstTab] = useState(true);
  // true - Таски/Фрилансеры, false - Фрилансеры/Мои заказы
  const { currentUser, isAuthenticated } = useContext(Context);
  const [tasks, setTasks] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const contentBorderAuthorized = `content__border${
    isAuthenticated ? ' content__border-authorized' : ''
  }`;

  useEffect(() => {
    if (currentUser?.is_customer || !isAuthenticated) {
      Api.getFreelancers()
        .then((response) => {
          setFreelancers(response.results);
        })
        .catch((error) => {
          console.error(error);
        });
    }

    if (currentUser?.is_worker) {
      Api.getTasksWithAuthorization()
        .then((response) => {
          setTasks(response.results);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      Api.getTasks()
        .then((response) => {
          setTasks(response.results);
        })
        .catch((error) => {
          console.error(error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // function handleFreelanceFilter(filter) {
  //   setFreelanceFilter(filter);
  // }

  return (
    <main className="content">
      {!isAuthenticated && (
        <>
          <StartWork />
          <Marquee>
            <div className="content__image-decorate">
              {'//       контент       //       дизайн       //       разработка       //       '}
              {'тестирование       //       маркетинг       //       контент       //       '}
              {'дизайн       //       разработка       //       тестирование       //       '}
              {'маркетинг       //       контент       //       дизайн       //       '}
              {'разработка       //       тестирование       //       маркетинг       '}
              {'//       контент       //       дизайн       //       разработка       '}
              {'//       тестирование       //       маркетинг       //       контент       '}
              {'//       дизайн       //       разработка       //       тестирование       '}
              {'//       маркетинг       //       контент       //       дизайн       '}
              {'//       разработка       //       тестирование       //       маркетинг       '}
              {'//       контент       //       дизайн       //       разработка       //       '}
              {'тестирование       //       маркетинг       //       контент       //       '}
              {'дизайн       //       разработка       //       тестирование       //       '}
              {'маркетинг       '}
            </div>
          </Marquee>
        </>
      )}
      <div className={contentBorderAuthorized} />
      <div className="content__order-container">
        <section className="freelance-order">
          <div className="freelance-order__column-order">
            <TabsMain isFirstTab={isFirstTab} setIsFirstTab={setIsFirstTab} />
            <Search />
            <CardList isFirstTab={isFirstTab} tasks={tasks} freelancers={freelancers} />
          </div>
          <div className="freelance-order__column-filter">
            <Filters
            // handleFreelanceFilter={handleFreelanceFilter}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export { Main };

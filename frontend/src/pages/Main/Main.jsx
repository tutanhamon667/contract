import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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

  const [searchQuery, setSearchQuery] = useState(useLocation().search);

  useEffect(() => {
    if (currentUser?.is_customer || !isAuthenticated) {
      const freelancerSearchQuery = searchQuery
        .replaceAll('category', 'categories')
        .replace('min_budget', 'min_payrate')
        .replace('max_budget', 'max_payrate');

      Api.getFreelancers(freelancerSearchQuery)
        .then((response) => {
          setFreelancers(response.results);
          
        })
        .catch((error) => {
          console.error(error);
        });
    }

    if (currentUser?.is_worker) {
      Api.getTasksWithAuthorization(searchQuery)
        .then((response) => {
          setTasks(response.results);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      Api.getTasks(searchQuery)
        .then((response) => {
          setTasks(response.results);
        })
        .catch((error) => {
          console.error(error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, searchQuery]);

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
            <Search setSearchQuery={setSearchQuery} />
            <CardList isFirstTab={isFirstTab} tasks={tasks} freelancers={freelancers} />
          </div>
          <div className="freelance-order__column-filter">
            <Filters
              setSearchQuery={setSearchQuery}
              // handleFreelanceFilter={handleFreelanceFilter}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export { Main };

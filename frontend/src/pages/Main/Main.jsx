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

  const [firstTabData, setFirstTabData] = useState([]);
  const [secondTabData, setSecondTabData] = useState([]);

  const [firstTabNavigation, setFirstTabNavigation] = useState({ next: null, previous: null });
  const [secondTabNavigation, setSecondTabNavigation] = useState({ next: null, previous: null });

  const contentBorderAuthorized = `content__border${isAuthenticated ? ' content__border-authorized' : ''}`;

  const [searchQuery, setSearchQuery] = useState(useLocation().search);
  const freelancerSearchQuery = searchQuery
    .replaceAll('category', 'categories')
    .replace('min_budget', 'min_payrate')
    .replace('max_budget', 'max_payrate');


  function setFirstTabValues(response) {
    setFirstTabData(response.results);
    setFirstTabNavigation({ next: response.next, previous: response.previous })
  }

  function setSecondTabValues(response) {
    setSecondTabData(response.results);
    setSecondTabNavigation({ next: response.next, previous: response.previous })
  }

  function setFirstTabValuesOnError() {
    setFirstTabData([]);
    setSecondTabNavigation({ next: null, previous: null })
  }

  function setSecondTabValuesOnError() {
    setSecondTabData([]);
    setSecondTabNavigation({ next: null, previous: null })
  }

  useEffect(() => {

    if (!isAuthenticated) {
      Api.getFreelancers(freelancerSearchQuery)
        .then((response) => {
          setSecondTabValues(response)
        })
        .catch((error) => {
          console.error(error);
          setSecondTabValuesOnError()
        });

      Api.getTasks(searchQuery)
        .then((response) => {
          setFirstTabValues(response)
        })
        .catch((error) => {
          console.error(error);
          setFirstTabValuesOnError(response)
        });
    }


    if (currentUser?.is_customer) {

      Api.getFreelancers(freelancerSearchQuery)
        .then((response) => {
          setFirstTabValues(response)
        })
        .catch((error) => {
          console.error(error);
          setFirstTabValuesOnError(response)
        });

      Api.getTasksCustomerWithAuthorization(searchQuery, currentUser.id)
        .then((response) => {
          setSecondTabValues(response)
        })
        .catch((error) => {
          console.error(error);
          setSecondTabValuesOnError()
        });
    }


    if (currentUser?.is_worker) {
      Api.getTasksWithAuthorization(searchQuery)
        .then((response) => {
          setFirstTabValues(response)
        })
        .catch((error) => {
          console.error(error);
          setFirstTabValuesOnError(response)
        });

      Api.getTasksFreelancerWithAuthorization(searchQuery)
        .then((response) => {
          setSecondTabValues(response)
        })
        .catch((error) => {
          console.error(error);
          setSecondTabValuesOnError()
        });
    }
  }, [location, searchQuery]);

  function loadFirstTabPaginationData(request) {
    Api.getDataByPagination(request)
      .then((response) => {
        setFirstTabValues(response)
      })
      .catch((error) => {
        console.error(error);
        setFirstTabValuesOnError(response)
      });
  }

  function loadSecondTabPaginationData(request) {
    Api.getDataByPagination(request)
      .then((response) => {
        setSecondTabValues(response)
      })
      .catch((error) => {
        console.error(error);
        setSecondTabValuesOnError()
      });
  }

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
            <CardList
              isFirstTab={isFirstTab}
              firstTabData={firstTabData}
              secondTabData={secondTabData}
              firstTabNavigation={firstTabNavigation}
              loadFirstTabPaginationData={loadFirstTabPaginationData}
              secondTabNavigation={secondTabNavigation}
              loadSecondTabPaginationData={loadSecondTabPaginationData}
            />
          </div>
          <div className="freelance-order__column-filter">
            <Filters
              setSearchQuery={setSearchQuery}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export { Main };

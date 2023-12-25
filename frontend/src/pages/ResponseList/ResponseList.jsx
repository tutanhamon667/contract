import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import * as Api from '../../utils/Api';
import { Context } from '../../context/context';
import { Search } from '../../components/Search/Search';
import { CardList } from '../../components/CardList/CardList';
import { Filters } from '../../components/Filters/Filters';
import './ResponseList.css';

function ResponseList() {
  const { currentUser } = useContext(Context);
  const [firstTabData, setFirstTabData] = useState([]);
  const [firstTabNavigation, setFirstTabNavigation] = useState({
    next: undefined,
    previous: undefined,
  });
  const [searchQuery, setSearchQuery] = useState(useLocation().search);
  const freelancerSearchQuery = searchQuery
    .replaceAll('category', 'categories')
    .replace('min_budget', 'min_payrate')
    .replace('max_budget', 'max_payrate');
  const { id } = useParams();

  function setFirstTabValues(response) {
    // console.log(response);
    setFirstTabData(response.results);
    setFirstTabNavigation({ next: response.next, previous: response.previous });
  }

  function setFirstTabValuesOnError() {
    setFirstTabData([]);
  }

  useEffect(() => {
    if (currentUser?.is_customer) {
      Api.getResponses(id, freelancerSearchQuery)
        .then((response) => {
          setFirstTabValues(response);
        })
        .catch((error) => {
          console.error(error);
          setFirstTabValuesOnError(response);
        });
    }
  }, [location, searchQuery]);

  return (
    currentUser?.is_customer && (
      // <div className="content__order-container">
      <div className="content__order-container response-list__container">
        <Link to={-1} className="order__back-container response-list__back-container">
          <div className="order__back" />
          Назад
        </Link>
        <section className="freelance-order">
          <div className="freelance-order__column-order">
            <Search setSearchQuery={setSearchQuery} />
            <CardList
              isFirstTab={true}
              firstTabData={firstTabData}
              firstTabNavigation={firstTabNavigation}
            />
          </div>
          <div className="freelance-order__column-filter">
            <Filters setSearchQuery={setSearchQuery} marginTop={82} />
          </div>
        </section>
      </div>
    )
  );
}

export { ResponseList };

const BACKEND_BASE_URL = 'https://taski.ddns.net/api';
// const BACKEND_BASE_URL = 'http://127.0.0.1:8000/api';

const industryCategoryOptions = [
  { label: 'Дизайн', value: 'design' },
  { label: 'Разработка', value: 'development' },
  { label: 'Тестирование', value: 'testing' },
  { label: 'Администрирование', value: 'administration' },
  { label: 'Маркетинг', value: 'marketing' },
  { label: 'Контент', value: 'content' },
  { label: 'Разное', value: 'other' },
];

const degreeOptions = [
  { label: 'Студент', value: 'student' },
  { label: 'Бакалавр', value: 'bachelor' },
  { label: 'Специалист', value: 'specialist' },
  { label: 'Магистр', value: 'master' },
];

const userFreelancer = {
  id: '1',
  first_name: 'Иван',
  last_name: 'Петров',
  email: 'email@mail.ru',
  password: 'topSecret1',
  role: 'Фрилансер',
  rate: '300',
  portfolio: 'https://myportfolio.ru',
  skills: ['CSS', 'HTML', 'JavaScript'],
  education: 'МГУ имени М.В. Ломоносова',
};

const userCustomer = {
  id: '2',
  first_name: 'Сергей',
  last_name: 'Иванов',
  email: 'boss@mail.ru',
  password: 'imsuperboss1',
  role: 'Заказчик',
};

export { BACKEND_BASE_URL, industryCategoryOptions, degreeOptions, userFreelancer, userCustomer };

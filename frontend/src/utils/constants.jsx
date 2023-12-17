const BACKEND_BASE_URL = 'https://taski.ddns.net/api';
// const BACKEND_BASE_URL = 'http://127.0.0.1:8000/api';

const industryAndCategoryOptions = [
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

export { BACKEND_BASE_URL, industryAndCategoryOptions, degreeOptions };

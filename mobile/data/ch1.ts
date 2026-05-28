import { Chapter } from '../types';

const ch1: Chapter = {
  id: 'ch1',
  title: 'Числа от 1 до 5',
  lessons: [
    {
      id: 'ch1_l1',
      title: 'Урок 1. Числа 1 и 2',
      exercises: [
        { type: 'arithmetic', question: '1 + 1 = ?', answer: 2 },
        { type: 'counting', text: 'Сколько яблок?', icon: '🍎', count: 1, answer: 1 },
        { type: 'word_problem', text: 'На столе лежало 1 яблоко. Положили ещё 1. Сколько яблок стало?', answer: 2 },
        { type: 'arithmetic', question: '2 - 1 = ?', answer: 1 },
        { type: 'counting', text: 'Сколько шаров?', icon: '🎈', count: 2, answer: 2 },
      ],
    },
    {
      id: 'ch1_l2',
      title: 'Урок 2. Число 3',
      exercises: [
        { type: 'arithmetic', question: '2 + 1 = ?', answer: 3 },
        { type: 'arithmetic', question: '3 - 1 = ?', answer: 2 },
        { type: 'counting', text: 'Сколько грибов?', icon: '🍄', count: 3, answer: 3 },
        { type: 'word_problem', text: 'В корзине 2 гриба. Нашли ещё 1. Сколько грибов в корзине?', answer: 3 },
        { type: 'arithmetic', question: '3 - 2 = ?', answer: 1 },
      ],
    },
    {
      id: 'ch1_l3',
      title: 'Урок 3. Числа 4 и 5',
      exercises: [
        { type: 'arithmetic', question: '3 + 1 = ?', answer: 4 },
        { type: 'arithmetic', question: '4 + 1 = ?', answer: 5 },
        { type: 'counting', text: 'Сколько звёзд?', icon: '⭐', count: 4, answer: 4 },
        { type: 'word_problem', text: 'На ветке сидели 3 птицы. Прилетела ещё 1. Сколько птиц стало?', answer: 4 },
        { type: 'arithmetic', question: '5 - 2 = ?', answer: 3 },
        { type: 'counting', text: 'Сколько цветков?', icon: '🌸', count: 5, answer: 5 },
      ],
    },
  ],
};

export default ch1;

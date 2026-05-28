import { Chapter } from '../types';

const ch2: Chapter = {
  id: 'ch2',
  title: 'Числа от 6 до 10',
  lessons: [
    {
      id: 'ch2_l1',
      title: 'Урок 1. Числа 6 и 7',
      exercises: [
        { type: 'arithmetic', question: '5 + 1 = ?', answer: 6 },
        { type: 'arithmetic', question: '6 + 1 = ?', answer: 7 },
        { type: 'counting', text: 'Сколько ягод?', icon: '🍓', count: 6, answer: 6 },
        { type: 'word_problem', text: 'В вазе 5 цветков. Поставили ещё 1. Сколько цветков стало?', answer: 6 },
        { type: 'arithmetic', question: '7 - 1 = ?', answer: 6 },
      ],
    },
    {
      id: 'ch2_l2',
      title: 'Урок 2. Числа 8 и 9',
      exercises: [
        { type: 'arithmetic', question: '7 + 1 = ?', answer: 8 },
        { type: 'arithmetic', question: '8 + 1 = ?', answer: 9 },
        { type: 'counting', text: 'Сколько рыбок?', icon: '🐟', count: 8, answer: 8 },
        { type: 'word_problem', text: 'В пруду плавали 7 рыбок. Приплыла ещё 1. Сколько рыбок стало?', answer: 8 },
        { type: 'arithmetic', question: '9 - 1 = ?', answer: 8 },
      ],
    },
    {
      id: 'ch2_l3',
      title: 'Урок 3. Число 10',
      exercises: [
        { type: 'arithmetic', question: '9 + 1 = ?', answer: 10 },
        { type: 'arithmetic', question: '10 - 1 = ?', answer: 9 },
        { type: 'counting', text: 'Сколько пальцев?', icon: '🖐️', count: 10, answer: 10 },
        { type: 'word_problem', text: 'В корзине 9 яблок. Положили ещё 1. Сколько яблок стало?', answer: 10 },
        { type: 'arithmetic', question: '10 - 5 = ?', answer: 5 },
      ],
    },
  ],
};

export default ch2;

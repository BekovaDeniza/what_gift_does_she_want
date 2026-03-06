const holidayLabels = {
  '8march': '8 марта',
  anniversary: 'Годовщина отношений',
  birthday: 'День рождения',
  valentine: 'День святого Валентина',
};

const ageLabels = {
  under18: 'До 18 лет',
  '18-25': '18–25 лет',
  '26-35': '26–35 лет',
  '36-50': '36–50 лет',
  '50+': 'Старше 50',
};

const categoryLabels = {
  fashion: 'Одежда и аксессуары',
  jewelry: 'Украшения и бижутерия',
  tech: 'Техника и гаджеты',
  beauty: 'Красота и косметика',
  home: 'Для дома и уюта',
  experience: 'Впечатления',
  books: 'Книги и канцелярия',
  sport: 'Спорт и активный отдых',
  food: 'Еда и напитки',
  box: 'Подарочная коробка (box)',
  certificate: 'Сертификат в магазин',
  other: 'Другое',
};

const hobbyLabels = {
  creative: 'Творчество',
  cooking: 'Кулинария',
  gaming: 'Видеоигры',
  reading: 'Чтение',
  travel: 'Путешествия',
  fitness: 'Фитнес и спорт',
  dance: 'Танцы',
  music: 'Музыка',
  photo: 'Фотография',
  plants: 'Растения',
  fashion_hobby: 'Мода и стиль',
  tech_hobby: 'Технологии',
  none: 'Не указано',
};

const priceLabels = {
  under1k: 'До 1 000 ₽',
  '1k-3k': '1 000 – 3 000 ₽',
  '3k-5k': '3 000 – 5 000 ₽',
  '5k-10k': '5 000 – 10 000 ₽',
  '10k-20k': '10 000 – 20 000 ₽',
  '20k+': 'От 20 000 ₽',
  any: 'Бюджет не важен',
};

const styleLabels = {
  minimal: 'Минимализм',
  bright: 'Яркое',
  practical: 'Практичное',
  luxury: 'Роскошное',
  handmade: 'Ручная работа',
  funny: 'С юмором',
  romantic: 'Романтичное',
};

const emotionLabels = {
  surprise: 'Удивление и восторг',
  warmth: 'Тепло и забота',
  laugh: 'Смех и радость',
  nostalgia: 'Ностальгия',
  luxury_feel: 'Чувство роскоши',
  relax: 'Расслабление',
};

const colorLabels = {
  pastel: 'Пастельные',
  bright_colors: 'Яркие',
  dark: 'Тёмные',
  neutral: 'Нейтральные',
  any_color: 'Не важно',
};

const sizeLabels = {
  small: 'Маленький',
  medium: 'Средний',
  large: 'Большой',
  any_size: 'Не важно',
};

const wrappingLabels = {
  beautiful: 'Красивая упаковка важна',
  simple: 'Простая упаковка',
  eco: 'Экологичная',
  no: 'Без упаковки',
};

const boxContentLabels = {
  sweets: 'Сладости',
  beauty: 'Косметика и уход',
  tea_coffee: 'Чай, кофе',
  candles_aroma: 'Свечи и ароматы',
  stationery: 'Канцелярия',
  themed: 'Тематическая',
  mix: 'Микс',
  surprise: 'Полный сюрприз',
};

const boxSizeLabels = {
  mini: 'Мини (3–5 предметов)',
  standard: 'Стандартная (5–8)',
  large: 'Большая (8+)',
};

function label(value, map) {
  return map[value] || value || '—';
}

export function formatSurveyMessage(answers, recommendation) {
  const lines = [];

  if (answers.name && answers.name.trim()) {
    lines.push(`<b>Результаты опроса от ${answers.name.trim()}</b>`);
  } else {
    lines.push('<b>Результаты опроса «Подарок мечты»</b>');
  }

  lines.push('');
  lines.push('Праздник: ' + label(answers.holiday, holidayLabels));
  lines.push('Возраст: ' + label(answers.age, ageLabels));

  const hobbies = (answers.hobbies || []).map((h) => label(h, hobbyLabels)).filter(Boolean);
  if (hobbies.length) {
    lines.push('Увлечения: ' + hobbies.join(', '));
  }

  lines.push('Категория: ' + label(answers.category, categoryLabels));
  lines.push('Бюджет: ' + label(answers.price, priceLabels));

  if (answers.category === 'box') {
    if (answers.boxContent) lines.push('Содержимое коробки: ' + label(answers.boxContent, boxContentLabels));
    if (answers.boxSize) lines.push('Размер коробки: ' + label(answers.boxSize, boxSizeLabels));
  }

  lines.push('Стиль: ' + label(answers.style, styleLabels));
  lines.push('Эмоция: ' + label(answers.emotion, emotionLabels));
  lines.push('Цвета: ' + label(answers.color, colorLabels));
  lines.push('Размер: ' + label(answers.size, sizeLabels));
  lines.push('Упаковка: ' + label(answers.wrapping, wrappingLabels));

  if (answers.notes && answers.notes.trim()) {
    lines.push('');
    lines.push('Пожелания: ' + answers.notes.trim());
  }
  if (answers.specificIdea && answers.specificIdea.trim()) {
    lines.push('');
    lines.push('На уме: ' + answers.specificIdea.trim());
  }
  if (recommendation && recommendation.trim()) {
    lines.push('');
    lines.push('Наши предположения: ' + recommendation.trim());
  }
  return lines.join('\n');
}

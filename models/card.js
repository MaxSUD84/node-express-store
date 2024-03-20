import file from './file.js';

// import path from 'node:path';
// const p = path.join(process.cwd(), '../data', 'card.json');

const CARD_FILENAME = 'card.json';

export class Card {
  static async add(work) {
    const card = await Card.fetch();

    const idx = card.works.findIndex((c) => c.id === work.id);
    const _work = card.works[idx];

    if (_work) {
      // Работа уже есть в корзине
      _work.count++;
      card.works[idx] = _work;
    } else {
      // Нужно добавить работу в корзину
      work.count = 1;
      card.works.push(work);
    }
    card.price += +work.price;
    return file.writeToFile(CARD_FILENAME, card);
  }

  static async fetch() {
    // console.log(p); // проверка пути
    return file.getAll(CARD_FILENAME);
  }

  static async remove(id) {
    const card = await Card.fetch();

    const idx = card.works.findIndex((c) => c.id === id);
    const work = card.works[idx];

    if (work.count === 1) {
      // Удалить
      card.works = card.works.filter((c) => c.id !== id);
    } else {
      // Изменить количество
      card.works[idx].count--;
    }

    card.price -= work.price;

    return file.writeToFile(CARD_FILENAME, card).then(() => card);
  }
}

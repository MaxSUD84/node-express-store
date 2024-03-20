import { Router } from 'express';
import { Card } from '../models/card.js';
import file from '../models/file.js';
import { Course as Work } from '../models/course.js';

export const router = Router();

router.get('/', async (req, res) => {
  const readCard = await Card.fetch();
  res.render('card', {
    title: 'Корзина',
    isCard: true,
    works: readCard.works,
    price: readCard.price,
  });
});

router.post('/add', async (req, res) => {
  const work = await file.getById('works.json', req.body.id);
  await Card.add(work);

  res.redirect('/card');
});

router.delete('/remove/:id', async (req, res) => {
  const card = await Card.remove(req.params.id);
  res.status(200).json(card);
});

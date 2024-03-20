import { Router } from 'express';
import { Course as Work } from '../models/course.js';
export const router = Router();

router.get('/', (req, res) => {
  res.render('works', {
    title: 'Наши работы',
    isWorks: true,
  });
});

router.post('/add', async (req, res) => {
  const work = new Work({ ...req.body });
  await work.save();
  res.redirect('/works');
  res.end();
});

router.post('/edit', async (req, res) => {
  await Work.update(req.body);
  res.redirect('/catalog');
  res.end();
});

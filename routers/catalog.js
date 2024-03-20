import { Router } from 'express'
import { Course } from '../models/course.js'
import { default as MW } from '../middleware/index.js'

export const router = Router()

router.get('/', async (req, res) => {
    const works = await Course.find({})
        .populate('userId', 'email name')
        .select('price title img')

    res.render('catalog', {
        title: 'Каталог',
        isCatalog: true,
        works: works,
    })
})

router.get('/:id', async (req, res) => {
    const work = await Course.findById(req.params.id)
    res.render('work', {
        layout: 'empty',
        title: `Работа: ${work.title}`,
        work,
    })
})

router.get('/:id/edit', MW.AuthCH, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }
    const work = await Course.findById(req.params.id)
    res.render('work-edit', {
        // layout: "main",
        title: `Редактирование: ${work.title}`,
        work,
    })
})

router.post('/edit', MW.AuthCH, async (req, res) => {
    const { id } = req.body
    delete req.body.id
    await Course.findByIdAndUpdate(id, { ...req.body, userId: req.user })
    res.redirect('/catalog')
})

router.post('/remove', MW.AuthCH, async (req, res) => {
    const { id } = req.body
    delete req.body.id
    await Course.findByIdAndDelete(id)
    res.redirect('/catalog')
})

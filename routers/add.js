import { Router } from 'express'
import { Course } from '../models/course.js'
import { default as MW } from '../middleware/index.js' // MW.AuthCH,
export const router = Router()

router.get('/', MW.AuthCH, async (req, res) => {
    const works = await Course.find({})
    res.render('add', {
        title: 'Добавить работу',
        isAdd: true,
        works,
    })
})

router.post('/', MW.AuthCH, async (req, res) => {
    const work = await Course.create({ ...req.body, userId: req.user })
    try {
        await work.save()
        res.redirect('/catalog')
    } catch (error) {
        console.log(error)
    }
})

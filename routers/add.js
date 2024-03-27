import { Router } from 'express'
import { Course } from '../models/course.js'
import { default as MW } from '../middleware/index.js' // MW.AuthCH,
import { workValidators } from '../utils/validators.js'
import { validationResult } from 'express-validator'

export const router = Router()

router.get('/', MW.AuthCH, async (req, res) => {
    const works = await Course.find({})
    res.render('add', {
        title: 'Добавить работу',
        isAdd: true,
        works,
    })
})

router.post('/', MW.AuthCH, workValidators, async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).render('add', {
            title: 'Добавить работу',
            isAdd: true,
            error: errors
                .array()
                .map((el, ind) => `[${ind + 1}]. ${el.msg}`)
                .join('\t'),
            data: {
                ...req.body,
            },
        })
    }

    const work = await Course.create({ ...req.body, userId: req.user })
    try {
        await work.save()
        res.redirect('/catalog')
    } catch (error) {
        console.log(error)
    }
})

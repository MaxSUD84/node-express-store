import { Router } from 'express'
import { Course } from '../models/course.js'
import { default as MW } from '../middleware/index.js'
import { workValidators } from '../utils/validators.js'
import { validationResult } from 'express-validator'
// import { default as mailer } from '../emails/mailer-service.js'

export const router = Router()
function isOwner(work, req) {
    return work.userId.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {
    try {
        const works = await Course.find({})
            .populate('userId', 'email name')
            .select('price title img')

        res.render('catalog', {
            title: 'Каталог',
            isCatalog: true,
            userId: req.user ? req.user._id.toString() : null,
            works: works,
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const work = await Course.findById(req.params.id)
        res.render('work', {
            layout: 'empty',
            title: `Работа: ${work.title}`,
            work,
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/edit', MW.AuthCH, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }

    try {
        const work = await Course.findById(req.params.id)
        if (!isOwner(work, req)) {
            return res.redirect('/catalog')
        }

        res.render('work-edit', {
            // layout: "main",
            title: `Редактирование: ${work.title}`,
            work,
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/edit', MW.AuthCH, workValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        const { id } = req.body

        if (!errors.isEmpty()) {
            return res.status(422).redirect(`/catalog/${id}/edit?allow=true`)
        }

        delete req.body.id
        const work = await Course.findById(id)
        if (!isOwner(work, req)) {
            return res.redirect('/catalog')
        }
        Object.assign(work, req.body)
        await work.save()
        res.redirect('/catalog')
    } catch (error) {
        console.log(error)
    }
})

router.post('/remove', MW.AuthCH, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id,
        })
        res.redirect('/catalog')
    } catch (error) {
        console.log(error)
    }
})

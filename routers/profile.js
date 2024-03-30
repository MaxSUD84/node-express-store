import { Router } from 'express'
import { default as MW } from '../middleware/index.js'

// *** Env validation ***
import { config } from 'dotenv-safe'
import { cwd } from 'node:process'
import { User } from '../models/user.js'

const env = config({
    allowEmptyValues: true,
    example: cwd() + '/.env.example',
})

// ********* CODE *********

export const router = Router()

router.get('/', MW.AuthCH, async (req, res) => {
    // console.log(req)
    res.render('profile', {
        title: 'Профиль',
        isProfile: true,
        user: req.user,
    })
})

router.post('/', MW.AuthCH, MW.FileMW.single('avatar'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id)

        const toChange = {
            name: req.body.name,
        }
        // console.log(req.file)

        if (req.file) {
            toChange.avatarUrl = req.file.path
        }

        Object.assign(user, toChange)
        await user.save()
        res.redirect('/profile')
    } catch (e) {
        console.log(e)
    }
})

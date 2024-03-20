import { Router } from 'express'
import { User } from '../models/user.js'

const bcrypt = await import('bcryptjs').then((bc) => bc.default)

export const router = Router()

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError'),
    })
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const candidate = await User.findOne({ email })

        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password)

            if (areSame) {
                req.session.user = candidate
                req.session.isAuthenticated = true
                req.session.save((err) => {
                    if (err) throw new Error(err)
                    res.redirect('/')
                })
                return
            }
            req.flash('loginError', 'Неправильный пароль')
        } else {
            req.flash(
                'loginError',
                'Пользователь с таким #email не зарегистрирован'
            )
            // throw new Error('Пользователь с таким email существует')
        }
        res.redirect('/auth/login#login')
    } catch (error) {
        console.log(error)
    }
})

router.post('/register', async (req, res) => {
    try {
        const { email, password, repeat, name } = req.body

        const candidate = await User.findOne({ email })

        if (!candidate) {
            const hashPassword = await bcrypt.hash(password, 10)
            const user = new User({
                email,
                password: hashPassword,
                repeat,
                name,
                cart: {},
            })
            await user.save()
        } else {
            req.flash(
                'registerError',
                'Пользователь с таким #email уже существует'
            )
            // throw new Error('Пользователь с таким email существует')
        }
        res.redirect('/auth/login#login')
    } catch (error) {
        console.log(error)
    }
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})

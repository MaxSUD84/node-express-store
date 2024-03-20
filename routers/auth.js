import { Router } from 'express'
import { User } from '../models/user.js'
import nodemailer from 'nodemailer'
import keys from '../keys/index.js'
import registration from '../emails/registration.js'

const transport = nodemailer.createTransport({
    jsonTransport: true,
})

// const mail = {
//     from: 'maxsud1984@yandex.ru',
//     to: 'maksim.golodov@digitaltwin.ru',
//     subject: 'Test Mail',
//     text: "It's test message from Unisender",
// }

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

            // *** Nodemailer ***
            // transport.sendMail(mail, (err, info) => {
            //     console.log(info.envelope)
            //     console.log(info.messageId)
            //     console.log(info.message) // JSON string
            // })
            transport.sendMail(
                registration(keys.EMAIL_FROM, 'maksim.golodov@digitaltwin.ru'),
                (err, info) => {
                    if (err) console.log(err)
                    console.log(info.envelope)
                    console.log(info.messageId)
                    console.log(info.message)
                }
            )
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

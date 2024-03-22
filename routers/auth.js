import { Router } from 'express'
import crypto from 'node:crypto'
import { User } from '../models/user.js'
import { default as mailer } from '../emails/mailer-service.js'
import registration from '../emails/registration.js'
import reset from '../emails/reset.js'

// *** Env validation ***
import { config } from 'dotenv-safe'
import { cwd } from 'node:process'

const env = config({
    allowEmptyValues: true,
    example: cwd() + '/.env.example',
})

const bcrypt = await import('bcryptjs').then((bc) => bc.default)

// ********* CODE *********

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

            // *** Mailer middleware ***
            const sMail = await mailer.sendEmail(
                registration(env.required.EMAIL_TO, env.required.EMAIL_FROM)
            )

            if (sMail?.errors) {
                console.log(
                    '=> SENDING MAIL ERROR: ',
                    JSON.stringify(sMail.errors)
                )
            } else {
                console.info(
                    '=> MAIL SEND TO: ',
                    sMail?.email,
                    ' | email_Id: ',
                    sMail?.id
                )
            }
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

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Забыли пароль ?',
        error: req.flash('error'),
    })
})

router.post('/reset', async (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash(
                    'error',
                    'Что-то пошло не так, повторите попытку позже'
                )
                return res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex')
            const candidate = await User.findOne({ email: req.body.email })

            if (!candidate) {
                req.flash('error', 'Такого email нет')
                return res.redirect('/auth/reset')
            }

            candidate.resetToken = token
            candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
            await candidate.save()

            // *** Mailer middleware ***
            const sMail = await mailer.sendEmail(
                // reset(candidate.email, candidate.resetToken) - для production
                reset(env.required.EMAIL_TO, token)
            )

            if (sMail?.errors) {
                console.log(
                    '## SENDING MAIL ERROR: ',
                    JSON.stringify(sMail.errors)
                )
            } else {
                console.info(
                    '## RESET MAIL SEND TO: ',
                    sMail?.email,
                    ' | email_Id: ',
                    sMail?.id
                )
            }

            res.redirect('/auth/login')
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login')
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() },
        })

        if (!user) {
            req.flash('error', 'Истекло время жизни токена')
            return res.redirect('/auth/login')
        }

        res.render('auth/password', {
            title: 'Востановлить доступ',
            error: req.flash('error'),
            userId: user._id.toString(),
            token: req.params.token,
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: { $gt: Date.now() },
        })

        if (!user) {
            req.flash(
                'loginError',
                'Время жизни токена истекло или неправильный токен'
            )
            res.redirect('/auth/login')
        }

        user.password = await bcrypt.hash(req.body.password, 10)
        user.resetToken = undefined
        user.resetTokenExp = undefined
        await user.save()
        res.redirect('/auth/login')
    } catch (error) {
        console.log(error)
    }
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})

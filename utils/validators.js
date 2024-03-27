import { body, validationResult } from 'express-validator'
import { User } from '../models/user.js'

export const registerValidators = [
    // body('email').isEmail().withMessage('Введите корректный email')
    body('email')
        .isEmail()
        .withMessage('Введите корректный email')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value })
                if (user) {
                    return Promise.reject('Такой email уже занят')
                }
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail(),
    body('name', 'Имя должно быть минимум 2 символа')
        .isLength({ min: 2 })
        .trim(),
    body('password', 'Пароль должен быть мин. 6 символов')
        .isLength({ min: 6, max: 56 })
        .isAlphanumeric()
        .trim(),
    body('confirm', '')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Пароли должны совпадать!')
            }
            return true
        })
        .trim(),
]

export const workValidators = [
    body('title', 'Длина названия должно быть мин. 3 символа')
        .isLength({
            min: 3,
        })
        .trim(),
    body('price', 'Введите корректную цену').isNumeric(),
    body('img', 'Введите корректный URL').isURL(),
]

export const loginValidators = [
    body('email')
        .isEmail()
        .withMessage('Введите корректный email')
        .normalizeEmail(),
    body('password', 'Пароль должен быть мин. 6 символов')
        .isLength({ min: 6, max: 56 })
        .isAlphanumeric(),
]

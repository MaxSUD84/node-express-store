// *** Env validation ***
import { config } from 'dotenv-safe'
import { cwd } from 'node:process'

const env = config({
    allowEmptyValues: true,
    example: cwd() + '/.env.example',
})

/**
 * Service constant
 * We use UNISENDER
 */

const API_URI = 'https://api.unisender.com/ru/api/'
const API_FUNC = {
    send: 'sendEmail',
    check: 'checkEmail',
}
const api_key = env.required.UNISENDER_API_KEY
const sender_email = env.required.EMAIL_FROM

export default {
    // Проверка статуса письма по id
    check: async (id) => {
        // Создаем запрос ссылку запроса
        // API_URL/checkEmail?format=json&api_key=API_KEY&email_id=33110613181
        const url =
            API_URI +
            API_FUNC.check +
            '?' +
            new URLSearchParams({
                format: 'json',
                api_key,
                email_id: id,
            }).toString()
        const r = await fetch(url)
            .then((response) => response.json())
            .catch((err) => {
                throw new Error(
                    'Не удается выполить запрос checkMail c id:' +
                        id +
                        '.' +
                        err
                )
            })
        return (
            r.result.statuses[0] || {
                id,
                status: 'Письмо с таким id не отправлялось',
            }
        )
    },
    // Отправка письма
    // API_URL/sendEmail?format=json
    //    &api_key=API_KEY
    //    &email=GMV+<MAILTO>
    //    &sender_name=NODE_EXPRESSS_SHOP
    //    &sender_email=sender_email
    //    &subject=SUBJECT
    //    &body=SOME+TEXT+BODY
    //    &error_checking=1
    sendEmail: async ({ to, subject, body }) => {
        const url = API_URI + API_FUNC.send + '?'
        const params = new URLSearchParams({ format: 'json' })
        params.set('api_key', api_key)
        params.set('email', to)
        params.set('sender_name', 'NODE_EXPRESS_SHOP')
        params.set('sender_email', sender_email)
        params.set('subject', subject)
        params.set('body', body)
        params.set('list_id', 1)
        params.set('error_checking', 1)
        params.toString()

        // console.log(url + params)

        // let r = null
        // fetch(API_URI + API_FUNC.send, {
        //     method: 'POST',
        //     body: params,
        // })
        const r = await fetch(url + params)
            .then((response) => {
                return response.json()
            })
            .catch((err) => {
                throw new Error(err)
            })

        // console.log(r)

        return (
            r?.result[0] || {
                status: 'Не удалось отправить письмо',
            }
        )
    },
}

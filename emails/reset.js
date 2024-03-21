// *** Env validation ***
import { config } from 'dotenv-safe'
import { cwd } from 'node:process'

const env = config({
    allowEmptyValues: true,
    example: cwd() + '/.env.example',
})

export default function (toEmail, token) {
    return {
        to: toEmail,
        from: env.required.EMAIL_FROM,
        subject: 'Востановление доступа',
        // text: 'I hope this message gets buffered!',
        // '<p>Вы успешно создали акаунт с email: ' + toEmail + '</p>',
        body: `
            <h1>Вызабыли пароль ???</h1>
            <p>Если нет, то проигнорируйте данное письмо.</p>
            <p>Иначе перейдите по ссылке:</p>
            <p><a href="${env.required.BASE_URL}/auth/password/${token}">Востановить доступ</a></p>
            <hr />
            <a href="${env.required.BASE_URL}">Мой магазин</a>
        `,
    }
}

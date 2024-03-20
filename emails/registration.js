export default function (toEmail, fromEmail) {
    return {
        to: toEmail,
        from: fromEmail,
        subject: 'Аккаунт создан',
        // text: 'I hope this message gets buffered!',
        html: `
            <h1>Добро пожаловать в магазин</h1>
            <p>Вы успешно создали аакаунт с email - ${toEmail}</p>
        `,
    }
}

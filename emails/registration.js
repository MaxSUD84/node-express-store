export default function (toEmail, fromEmail) {
    return {
        to: toEmail,
        from: fromEmail,
        subject: 'Аккаунт создан',
        // text: 'I hope this message gets buffered!',
        // '<p>Вы успешно создали акаунт с email: ' + toEmail + '</p>',
        body: `
            <h1>Добро пожаловать в магазин</h1>
            <p>Вы успешно создали акаунт с email - ${toEmail}</p>
            <hr />
            <a href="http://localhost:3000/">Мой магазин</a>
        `,
    }
}

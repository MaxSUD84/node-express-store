import { doubleCsrf } from 'csrf-csrf'
import { config } from 'dotenv-safe'
import { cwd } from 'node:process'

const env = config({
    allowEmptyValues: true,
    example: cwd() + '/.env.example',
})

export const {
    invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
    generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
    validateRequest, // Also a convenience if you plan on making your own middleware.
    doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
    getSecret: () => env.required.SECRET,
    cookieName: 'x-csrf-token',
    cookieOptions: {
        // sameSite: 'lax', // Recommend you make this strict if posible
        // path: '/',
        // secure: true,
        // signed: true,
        sameSite: 'none', // Recommend you make this strict if posible
        path: '/',
        secure: false,
        signed: false,
    },
    // ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    // getTokenFromRequest: (req) => {
    //     const csrfT = req.headers['x-csrf-token']
    //     // console.log('doubleCsrf => getTokenFromRequest: ', csrfT)
    //     return csrfT
    // },
})

// Error handling, validation error interception
export const csrfErrorHandler = (error, req, res, next) => {
    if (error == invalidCsrfTokenError) {
        res.status(403).json({
            error: 'csrf validation error',
        })
    } else {
        next()
    }
}

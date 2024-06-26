import express from 'express'
import path from 'node:path'
// import fs from "node:fs";
import mongoose from 'mongoose'
import { default as MW } from './middleware/index.js'
import { err404 } from './middleware/error.js'
import { fileURLToPath } from 'url'
const exphbs = await import('express-handlebars')
// const hbs_helpers = await import('./utils/hbs-helpers.js')
import { default as hbs_helpers } from './utils/hbs-helpers.js'
import compression from 'compression'

// *** Env validation ***
import { config } from 'dotenv-safe'
const env = config({
    allowEmptyValues: true,
    example: './.env.example',
})

// *** Parse error ***
import flash from 'connect-flash'

// *** Session & Secure ***
const cors = await import('cors').then((c) => c.default)
const cookieParser = await import('cookie-parser').then((f) => f.default)
// *** Try to use csrf-csrf ***
// import { doubleCsrfProtection, generateToken } from './middleware/csrf.js'

import helmet from 'helmet'
import session from 'express-session'
const MongoDBStore = await import('connect-mongodb-session').then((m) =>
    m.default(session)
)

// *** Routes ***
import { router as routeHome } from './routers/home.js'
import { router as routeCatalog } from './routers/catalog.js'
import { router as routeAdd } from './routers/add.js'
import { router as routeOrders } from './routers/orders.js'
import { router as routeCard } from './routers/card.js'
import { router as routeAuth } from './routers/auth.js'
import { router as routeProfile } from './routers/profile.js'

// *** Models ***
// ***

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = env.required.PORT || 3000

const app = express()
app.use(
    cors({
        origin: ['*'],
        credentials: true,
    })
)
app.disable('x-powered-by')

const store = new MongoDBStore(
    {
        uri: env.required.MONGODB_URI,
        // databaseName: 'connect_mongodb_session_test',
        collection: 'sessions',
    },
    function (error) {
        if (error) console.error('Store error: ', error)
    }
)

store.on('error', function (error) {
    console.error('Event error: ', error)
})

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: hbs_helpers,
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
})

/** Handelbars */
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')
app.set('partials', __dirname + '/views' + '/partials')

/** Midleware до введения Авторизации */
// 65f0714681aae5f7cc69f13a
// app.use(async (req, res, next) => {
//     try {
//         const user = await User.findById('65f0714681aae5f7cc69f13a')
//         req.user = user
//         next()
//     } catch (error) {
//         console.log(error)
//     }
// })

/** Static */
app.use('/public', express.static(__dirname + '/public'))
app.use('/images', express.static(__dirname + '/images'))
app.use(express.urlencoded({ extended: true }))

app.use(
    session({
        secret: env.required.SESSION_SERCET,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        },
        store: store,
        resave: false,
        saveUninitialized: false,
    })
)

app.use(cookieParser(env.required.COOKIES_SECRET))

app.use(MW.AuthMW)
app.use(MW.UserFN)
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: false,
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js',
                ],
                scriptSrcAttr: 'none',
                objectSrc: ["'none'"],
                imgSrc: ["'self'", 'https://*'], //
                styleSrc: ["'self'"],
                upgradeInsecureRequests: [],
            },
        },
    })
)

// app.use(
//     helmet({
//         contentSecurityPolicy: false,
//     })
// )

// *** Try to use csrf-csrf ***
// app.get('/csrf-token', (req, res) => {
//     const csrfToken = generateToken(req, res)
//     console.log('csrfToken: ', csrfToken)
//     res.json({ csrfToken })
// })
// app.use(doubleCsrfProtection)

app.use(flash())
app.use(compression())

/** Routes */
app.use('/', routeHome)
app.use('/catalog', routeCatalog)
app.use('/add', routeAdd)
app.use('/card', routeCard)
app.use('/orders', routeOrders)
app.use('/auth', routeAuth)
app.use('/profile', routeProfile)

app.use(err404)

async function start() {
    try {
        mongoose.connection.on('connected', () => console.log('connected'))
        mongoose.connection.on('open', () => console.log('open'))
        mongoose.connection.on('disconnected', () =>
            console.log('disconnected')
        )
        mongoose.connection.on('reconnected', () => console.log('reconnected'))
        mongoose.connection.on('disconnecting', () =>
            console.log('disconnecting')
        )
        mongoose.connection.on('close', () => console.log('close'))

        await mongoose.connect(env.required.MONGODB_URI, {
            authSource: 'admin',
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        })
        mongoose.set('debug', true)

        /* * До введения Авторизации * /
        const candidat = await User.findOne()
        if (!candidat) {
            const user = new User({
                email: 'user@mail.ru',
                name: 'testUser',
                cart: { items: [] },
            })
            await user.save()
        }
        ***/

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (error) {
        console.log(error)
    }
}

start()

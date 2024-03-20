import { Router } from 'express'
// import { User } from '../models/user.js'
import { default as MW } from '../middleware/index.js' // MW.AuthCH,
import { Course as Work } from '../models/course.js'

export const router = Router()

function mapCartItems(cart) {
    // console.log(cart)
    const works =
        cart?.items?.map((w) => ({
            ...w.workId._doc,
            id: w.workId._id,
            count: w.count,
        })) || []
    const price = works.reduce((acc, cv) => (acc += cv.count * cv.price), 0)

    return {
        works,
        price,
    }
}

router.get('/', MW.AuthCH, async (req, res) => {
    // const ss = User.populate('cart')
    const user = await req.user.populate({
        path: 'cart.items.workId',
        model: Work,
        select: 'title price img',
    })

    const readCart = mapCartItems(user.cart)

    // console.log(JSON.stringify(readCart))

    res.render('card', {
        title: 'Корзина',
        isCard: true,
        works: readCart.works,
        price: readCart.price,
    })
})

router.post('/add', MW.AuthCH, async (req, res) => {
    const work = await Work.findById(req.body.id)
    await req.user.addToCart(work)
    res.redirect('/card')
})

router.delete('/remove/:id', MW.AuthCH, async (req, res) => {
    await req.user.removeFromCart(req.params.id)

    const user = await req.user.populate({
        path: 'cart.items.workId',
        model: Work,
        select: 'title price img',
    })

    const readCart = mapCartItems(user.cart)
    res.status(200).json(readCart)
})

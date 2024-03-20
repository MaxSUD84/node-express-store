import { Router } from 'express'
import { Order } from '../models/order.js'
import { Course as Work } from '../models/course.js'
import { default as MW } from '../middleware/index.js'

export const router = Router()

router.get('/', MW.AuthCH, async (req, res) => {
    try {
        const orders = await Order.find({
            'user.userId': req.user._id,
        }).populate('user.userId')

        res.render('orders', {
            isOrder: true,
            title: 'Заказы',
            orders: orders.map(
                (o) =>
                    console.log(o) || {
                        ...o._doc,
                        price: o.works.reduce(
                            (acc, cv) => (acc += cv.count * cv.work.price),
                            0
                        ),
                    }
            ),
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/', MW.AuthCH, async (req, res) => {
    try {
        const user = await req.user.populate({
            path: 'cart.items.workId',
            model: Work,
            select: 'title price img',
        })

        const works =
            user?.cart?.items.map((i) => ({
                count: i.count,
                work: { ...i.workId._doc },
            })) || []

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user,
            },
            works,
        })

        await order.save()
        await req.user.clearCart()

        res.redirect('/orders')
    } catch (error) {
        console.log(error)
    }
})

import { Schema, model } from 'mongoose'

const orderSchema = new Schema({
    user: {
        name: { type: String, required: true },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    date: { type: Date, default: Date.now },
    works: [
        {
            count: { type: Number, required: true, default: 1 },
            work: {
                required: true,
                type: Object,
                // type: Schema.Types.ObjectId,
                // ref: 'Course',
            },
        },
    ],
})

export const Order = model('Order', orderSchema)

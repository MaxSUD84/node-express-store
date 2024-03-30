import { Schema, model } from 'mongoose'

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatarUrl: String,
    resetToken: String,
    resetTokenExp: Date,
    cart: {
        items: [
            {
                count: { type: Number, required: true, default: 1 },
                workId: {
                    required: true,
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                },
            },
        ],
    },
})

userSchema.methods.addToCart = function (work) {
    const items = [...this.cart.items]
    const idx = items.findIndex(
        (w) => w.workId.toString() === work._id.toString()
    )

    if (idx < 0) {
        items.push({
            workId: work._id,
        })
    } else {
        items[idx].count += 1
    }
    this.cart = { items }
    return this.save()
}

userSchema.methods.removeFromCart = function (workId) {
    let items = [...this.cart.items]
    const idx = items.findIndex(
        (w) => w.workId.toString() === workId.toString()
    )

    if (idx >= 0 && --items[idx].count <= 0) {
        items = items.filter((w) => w.workId.toString() !== workId.toString())
    }

    this.cart = { items }
    return this.save()
}

userSchema.methods.clearCart = function () {
    this.cart = { items: [] }
    return this.save()
}

export const User = model('User', userSchema)

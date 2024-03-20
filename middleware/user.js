import { User } from '../models/user.js'

export const UserFN = async function (req, res, next) {
    if (!req.session.user) {
        return next()
    }

    req.user = await User.findById(req.session.user._id)
    next()
}

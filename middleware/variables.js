export const AuthMW = function (req, res, next) {
    res.locals.isAuth = req.session.isAuthenticated
    // *** Try to use csrf-csrf ***
    // res.locals.csrf = req.csrfToken()

    next()
}

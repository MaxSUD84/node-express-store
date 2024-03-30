import multer from 'multer'

export const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images')
    },
    filename: function (req, file, cb) {
        cb(null, Math.floor(Date.now() / 1000) + '-' + file.originalname)
    },
})

const allowedTypes = ['image/png', 'image/jpeg']

export const fileFilter = (req, file, cb) => {
    const check = allowedTypes.includes(file.mimetype)
    if (check) {
        cb(null, true)
    } else {
        console.log(
            '= multer error => Wrong file.mimetype in multer.f_fileFilter !!!'
        )
        cb(null, false)
    }
    // console.log(check)
    // cb(new Error('Wrong file.mimetype in multer.f_fileFilter !!!'))
}

export const FileMW = multer({ storage, fileFilter })

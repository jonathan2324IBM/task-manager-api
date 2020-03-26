//import express
const express = require('express')

const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

//connect to model
const User = require('../models/user')

//set up router
const router = new express.Router()

router.get('/test', (req, res) => {
    res.send('This is from user router')
})
//switched all calls to app.get etc to router.get etc
//create a new user async return a promise, but express only cares about res and req
//changed promise chaining to make code cleaner using try catch and async/await.
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    //everything after await only runs if promise is fullfilled

    try {

        await user.save()

        sendWelcomeEmail(user.email, user.name)

        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })

    } catch (e) {

        res.status(400).send(e)

    }

})

//Login user
router.post('/users/login', async(req, res) => {


    try {

        const user = await User.findByCredentials(req.body.email, req.body.password)

        const token = await user.generateAuthToken()



        res.send({ user, token })

    } catch (e) {


        res.status(400).send(e)
    }
})

//Logout of single session
router.post('/users/logout', auth, async (req, res) => {

    try {   

        req.user.tokens = req.user.tokens.filter((token) => {
            //token is an object with the token property
            //we say that if it does not match the req.token, we are keeping it
            return token.token !== req.token
        })

        await req.user.save()

        res.send()

    } catch (e) {

        res.status(500).send()

    }

    
})

//Logout all sessions
router.post('/users/logoutAll', auth, async (req, res) => {

    try {

        req.user.tokens =  []

        await req.user.save()

        res.send()


    } catch (e) {

        res.status(500).send()
    }

})


//query for all users
router.get('/users/me', auth, async (req, res) => {

    res.send(req.user)
})


//Update user info
//req.body conatins all updates
router.patch('/users/me', auth, async(req, res) => {

    const updates = Object.keys(req.body) // so when andrew puts height var, it will be stored in req.body
    const allowedUpdates = ['name', 'email', 'age', 'password']

    //looks at all updates returned by user input
    //if all are true, every returns true, even one false kills it
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }

    //const _id = req.user._id

    try{

        //const user = await User.findById(_id)

        //we get string value for name email etc
        //this is to get middleware running
        updates.forEach((update) => 
            //use bracket for dynamic object assignments
            req.user[update] = req.body[update]
        )
        //new returns new user with updates, run validators does exactly that
       //const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })

        await req.user.save()

    //    if (!user) {
    //        return res.status(404).send()
    //    } 

       res.send(req.user)

    } catch (e) {

        //if something goes wrong with connecting to database or if somethinig goes wrong with updates ex validation issues

        res.status(400).send(e)


    }
})

//Delete user
//putting auth in the function means that the async will only run if the user is authenticated
router.delete('/users/me', auth, async (req, res) => {
    //we have access to req.user because of auth middleware
    const _id = req.user._id

    try {

        // const user = await User.findByIdAndDelete(_id)

        // if(!user) {
        //     return res.status(404).send()
        // }

        await req.user.remove()

        sendCancelationEmail(req.user.email, req.user.name)

        res.status(200).send(req.user)


    } catch (e) {

        res.status(500).send()
    }

})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter (req, file, cb) {
        
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb( new Error ('Please upload a jpg, jpeg or png file.'))
        }

        cb(undefined, true)
        
    }
    
})


//we can only use req.file.buffer if the dest option on multer is not set up like above
//upload avatar and for updating avatar
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    
    //implementing sharp
    //for GUI, do that on client side
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

    req.user.avatar = buffer

    await req.user.save()
    res.send()

}, (error, req, res, next) => {

    res.status(400).send({ error: error.message })
})

//delete avatar route
router.delete('/users/me/avatar', auth, async(req, res) => {

    try {

        
        req.user.avatar = undefined

        await req.user.save()
        res.status(200).send()


    } catch (e) {

        res.status(500).send(e)
    }

})

//fetching an avatar
router.get('/users/:id/avatar', async (req, res) => {


    try {

        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {

            throw new Error ()

        }

        //setting a response header. For this app res.set('Content-Type', 'application/json')has been going on behind the scenes 
        res.set('Content-Type', 'image/png')//always works before we reformat the image before saving using sharp

        res.send(user.avatar)



    } catch (e) {

        res.status(404).send()
    }
})




module.exports = router
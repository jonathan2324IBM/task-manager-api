//requirements
const express = require('express')
require('./db/mongoose')

//setting up express.js & setting up port
const port = process.env.PORT
const app = express()

//the function is called when
//between req coming to server and when route handler is running
// app.use((req, res, next) => {

//     if(req.method === 'GET') {
//         res.send('GET requests are disabled')


//     } else {
//         next()

//     }

    
// })

// const multer = require('multer')
// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000 //megabytes- millions
//     },
//     //request, file being uploaded, callback
//     fileFilter(req, file, cb) {

//         if(!file.originalname.match(/\.(doc|docx)$/)) {

//             return cb(new Error ('Please upload a word document'))
//         }

//         cb(undefined, true)
//     } 
// })


// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// }, (error, req, res, next) => {

//     res.status(400).send({ error: error.message })
// })



//connecting routers
const userRouter = require('./routers/user')
const taskRouter = require ('./routers/task')
//.use() Bind application-level middleware to an instance of the app object by using the app.use() 
app.use(express.json())
app.use(taskRouter)
app.use(userRouter)

//tells app to listen on a certain port
app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})

// const pet = {

//     name: 'Hall'
// }

// pet.toJSON = function () {
//     console.log(this)
//     return this
// }

// console.log(JSON.stringify(pet))

// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async () => {
//     // const task = await Task.findById('5e7a251167518a24143da839')
//     // await task.populate('owner').execPopulate() //gives you the ability to get user profile
//     // console.log(task.owner)
//     const user = await User.findById("5e7a243acc7b035ffc1e51b8")
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)

// }

// main()


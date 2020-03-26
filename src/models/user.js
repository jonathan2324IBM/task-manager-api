const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')

//need to break this out to use middleware
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error('Age must be a positive number.')
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error ('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error ('Your password cannot contain the word password')
            }
        }
        


    },
    tokens : [{
        token: {
            type: String,
            required: true
        }
    }], 
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})
//statics are the methods defined on the Model. methods are defined on the document (instance).
//methods are accessable on all the instances
userSchema.methods.generateAuthToken = async function () {

    const user = this
    //console.log(user)-> to see what this returns
    //server does not store the token, it only generates and sends to client
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    //push onto tokens array.
    user.tokens = user.tokens.concat({ token: token })

    //now we are saving them to database
    await user.save()
    return token

}
//not actual changing what we store on the user document. Not stored in database this is just for mongoose
//to see who owns what and how they are related
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id', //users id
    foreignField: 'owner' //the field on the taskSchema
})

//toJSON
//when we pass an object to res.send, express is calling JSON.stringify on whatever we are passing behind the scenes
//toJSON will get called whenever that object gets stringified
//remember this is the object itself 
userSchema.methods.toJSON = function() {
    const user = this

    const userObject = user.toObject()//this is provided by mongoose, this will allow us to change what we expose.

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}
//Statics are pretty much the same as methods but allow for defining functions that exist directly on your Model.
//static methods are accessable on the model
userSchema.statics.findByCredentials = async(email, password) => {

    const user = await User.findOne({ email: email })

    if(!user) {
        throw new Error ('Unable to login.')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('Unable to login.')
    }

    return user
}


//using middleware on schema-> hash password before saving
//arrow functions dont bind this so use regular function
//instead of calling next() manually, you can use a function that returns a promise. In particular, you can use async/await.
//Pre middleware functions are executed one after another, when each middleware calls next
//Do not declare methods using ES6 arrow functions (=>). Arrow functions explicitly prevent binding this, 
//so your method will not have access to the document and the above examples will not work.
userSchema.pre('save', async function (next) {
    //define user as this. This is the document that is using this function. which we have been calling user throuogout
    //the router file.
    const user = this

    //is modified runs if password created or changed
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this

    await Task.deleteMany({ owner: user._id })

    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User
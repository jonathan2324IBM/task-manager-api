const mongoose = require('mongoose')
const validator = require('validator')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, //this is provided by mongoose
        required: true,
        ref: 'User'//type out model name-> now we can fetch user profile from task
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema )

module.exports = Task
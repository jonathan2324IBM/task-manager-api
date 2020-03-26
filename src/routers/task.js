//import express, Task model, and router 
const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth')

//add new task
router.post('/tasks', auth, async (req, res) => {


    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()

        res.status(201).send(task)


    } catch (e) {

        res.status(500).send(e)


    }

})


//query all tasks GET /tasks?completed=false-> only returns tasks to do, if true returns the tasks they finished
//Limit and skip GET/tasks?Limit=10&skip=0
//GET/tasks?sortBy=createdAt_asc or desc
router.get('/tasks', auth, async (req, res) => {

    const match = {}
    const sort = {}
    // console.log(req.query)
    // console.log(req.params)

    if (req.query.completed) {
        //cannot just do match.completed = req.query.completed because then match.completed
        //is set to a string true or false and not the boolean
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {

        //const tasks = await Task.find({ owner: req.user._id })

        await req.user.populate({ 
            path: 'tasks', 
            match: match, 
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sort
            }
         }).execPopulate()

        res.send(req.user.tasks)

    } catch (e) {

        res.status(400).send(e)

    }
})

//query one task by id
router.get('/tasks/:id', auth, async (req, res) => {
    //console.log(req.params)
    const _id = req.params.id

    try {
        //const task = await Task.findById(_id)
        const task = await Task.findOne({
            _id, owner: req.user._id
        })


        if(!task) {
            res.status(404).send()
        }

        res.status(201).send(task)

    } catch (e) {

        res.status(500).send()
    }
})

//update a task by id

router.patch('/tasks/:id', auth, async (req, res) => {

    //validate and sanitize input data-> error handling
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']

    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }



    const _id = req.params.id

    try {
        
        const task = await Task.findOne({ _id: _id, owner: req.user._id })
        //const task = await Task.findById(_id)


        //const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })

        if(!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => {
            
            task[update] = req.body[update]
        })

        await task.save()

        res.status(201).send(task)

    } catch (e) {

        res.status(400).send(e)

    }
})

//Delete Task

router.delete('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id

    try {

        const task = await Task.findOneAndDelete({ _id: _id, owner: req.user._id })

        if(!task) {
            return res.status(404).send()
        }

        res.status(201).send(task)

    } catch (e) {

        res.status(500).send(e)

    }
})

module.exports = router
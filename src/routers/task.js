const express = require('express')
const mongoose = require('mongoose')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body)
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

// GET /tasks?completed=true
// GET /tasks?skip=1&limit=1
// GET /tasks?sortBy=createdAt:desc 

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed)
        match.completed = req.query.completed === 'true'

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        //const tasks = await Task.find({})
        //const tasks = await Task.find({ owner: req.user._id }) could be used
        //await req.user.populate('tasks').execPopulate() // alternative
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
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    if (!mongoose.Types.ObjectId.isValid(_id))
        return res.status(404).send('Invalid id')

    try {
        //const task = await Task.findById(_id)
        const task = await Task.findOne({ _id: _id, owner: req.user._id })
        if (!task)
            return res.status(404).send('Not found')
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation)
        return res.status(400).send('Invalid updates')

    if (!mongoose.Types.ObjectId.isValid(_id))
        return res.status(404).send('Invalid id')

    try {
        //const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task)
            return res.status(404).send('Not found')
        
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        // commenting below, see user patch comments for more
        //const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    if (!mongoose.Types.ObjectId.isValid(_id))
        return res.status(404).send('Invalid id')

    try {
        //const task = await Task.findByIdAndDelete(_id)
        const task = await Task.findOneAndDelete({ _id: _id, owner: req.user._id })

        if (!task)
            return res.status(404).send('No task to delete')
        
        res.send(task)
    } catch (e) {
        res.send(500).send(e)
    }
})

module.exports = router
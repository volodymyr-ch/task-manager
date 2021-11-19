const express = require('express');

const Task = require('../models/task');
const auth = require('../middleware/auth');
const { getBooleanFilter, getSortByFilter } = require('../utils/query');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });

  try {
    await task.save();

    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

const getFilters = (reqQuery = {}) => {
  const { completed, limit = 10, skip = 0, sortBy } = reqQuery;
  const completedFilter = getBooleanFilter('completed', completed);
  const sortByFilter = getSortByFilter(sortBy);

  return {
    match: { ...completedFilter },
    options: {
      limit: parseInt(limit),
      skip: parseInt(skip),
      sort: sortByFilter,
    },
  };
};

router.get('/tasks', auth, async (req, res) => {
  try {
    const { match, options } = getFilters(req.query);

    await req.user.populate({
      path: 'tasks',
      match,
      options,
    });

    res.send(req.user.tasks);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(404).send(error);
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValidUpdates = updates.every((el) => allowedUpdates.includes(el));

  if (!isValidUpdates) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    task.save();

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(404).send(error);
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;

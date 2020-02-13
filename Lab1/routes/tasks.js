const express = require("express");
const router = express.Router();
const data = require("../data");
const taskData = data.tasks;

router.get("/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: "Must include an a ID" });
  }
  try {
    const task = await taskData.getTaskById(req.params.id);
    res.json(task);
  } catch (e) {
    res.status(404).json({ error: "Task not found" });
  }
});

router.get("/", async (req, res) => {
  const n = req.query.skip;
  const y = req.query.take;
  try {
    const taskList = await taskData.getAllTasks(n, y);
    res.json(taskList);
  } catch (e) {
    res.status(404).json({ error: `Tasks not found` + e });
  }
});

router.post("/", async (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const hoursEstimated = req.body.hoursEstimated;
  const completed = req.body.completed;
  let comments = [];
  if (req.body.comments) comments = req.body.comments;
  if (
    !title ||
    !description ||
    !hoursEstimated ||
    completed == undefined ||
    completed == null
  ) {
    res.status(400).json({
      error:
        "You must include the title, description, hours estimated, and completed parameters."
    });
    return;
  }
  try {
    res.json(
      await taskData.addTask(
        title,
        description,
        hoursEstimated,
        completed,
        comments
      )
    );
  } catch (e) {
    res.status(500).json({ error: `Task unable to be added` });
  }
});

router.put("/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: "Must include an a ID" });
  }
  //console.log("here");
  const id = req.params.id;
  if (!taskData.getTaskById(req.params.id)) {
    res.status(404).json({ error: `Task not found` });
  }
  //console.log("here");
  const title = req.body.title;
  const description = req.body.description;
  const hoursEstimated = req.body.hoursEstimated;
  const completed = req.body.completed;
  if (
    !title ||
    !description ||
    !hoursEstimated ||
    completed == undefined ||
    completed == null
  ) {
    res.status(400).json({
      error:
        "You must include the title, description, hours estimated, and completed parameters."
    });
    return;
  }
  try {
    //console.log("here");
    res.json(
      await taskData.updateTask(
        id,
        title,
        description,
        hoursEstimated,
        completed
      )
    );
    console.log("here");
  } catch (e) {
    res.status(500).json({ error: `Task unable to be updated` });
  }
});

router.patch("/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: "Must include an a ID" });
  }
  const id = req.params.id;
  if (!taskData.getTaskById(req.params.id)) {
    res.status(404).json({ error: `Task not found` });
  }
  const title = req.body.title;
  const description = req.body.description;
  const hoursEstimated = req.body.hoursEstimated;
  const completed = req.body.completed;
  if (
    !title &&
    !description &&
    !hoursEstimated &&
    (completed == undefined || completed == null)
  ) {
    res.status(400).json({
      error:
        "You must include the title, description, hours estimated, or completed parameters."
    });
    return;
  }
  try {
    res.json(
      await taskData.updateTask(
        id,
        title,
        description,
        hoursEstimated,
        completed
      )
    );
  } catch (e) {
    res
      .status(500)
      .json({ error: `Task unable to be updated with that information` });
  }
});

router.post("/:id/comments", async (req, res) => {
  if (!req.params.id || !req.body.name || !req.body.comment) {
    res.status(400).json({
      error: "You must enter a task id and include a comment"
    });
    return;
  }
  if (!taskData.getTaskById(req.params.id)) {
    res.status(404).json({ error: `Task not found` });
  }
  try {
    res.json(
      await taskData.addComment(req.params.id, req.body.name, req.body.comment)
    );
  } catch (e) {
    res.status(500).json({
      error: `Unable to add comment without the provided information.`
    });
  }
});

router.delete("/:taskId/:commentId", async (req, res) => {
  if (!req.params.taskId || !req.params.commentId) {
    res.status(400).json({
      error: "You must enter a task id and a comment id"
    });
    return;
  }
  if (!taskData.getTaskById(req.params.id)) {
    res.status(404).json({ error: `Task not found` });
  }
  try {
    res.json(
      await taskData.removeComment(req.params.taskId, req.params.commentId)
    );
  } catch (e) {
    res.status(500).json({ error: `Unable to remove comment from task` });
  }
});

module.exports = router;

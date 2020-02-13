const mongoCollections = require("../config/mongoCollections");
const tasks = mongoCollections.tasks;
const uuid = require("uuid");

module.exports = {
  async getAllTasks(skip, take) {
    let s = parseInt(skip);
    let t = parseInt(take);
    if (isNaN(s)) s = 0;
    if (isNaN(t)) t = 20;
    if (t > 100) throw "Take value cannot exceed 100";
    const taskCollection = await tasks();
    const allTasks = await taskCollection.find({}).toArray();
    if (s > allTasks.length) throw "Entered parameters are out of range";
    if (t + s > allTasks.length) return allTasks.slice(s);
    return allTasks.slice(s, s + t);
  },

  async getTaskById(id) {
    if (!id) throw "You must provide an id to search for";
    console.log(id);
    const taskCollection = await tasks();
    const task = await taskCollection.findOne({ _id: id });
    if (task === null) throw "No task found with that id";

    return task;
  },

  async addTask(title, description, hoursEstimated, completed, comments) {
    if (!title) throw "Missing title parameter";
    if (!description) throw "Missing description parameter";
    if (!hoursEstimated) throw "Missing hoursEstimated parameter";
    if (completed == undefined || completed == null)
      throw "Missing completed parameter";
    if (!comments) comments = [];

    if (typeof title !== "string") throw "Title must be a string";
    if (typeof description !== "string") throw "Description must be a string";
    if (typeof hoursEstimated !== "number")
      throw "Hours Estimated must be a number";
    if (typeof completed !== "boolean") throw "Completed must be a boolean";
    if (!Array.isArray(comments)) throw "Comments must be an array";

    //error checking for each comment

    comments.forEach(c => {
      if (typeof c.name !== "string") throw "Name must be of type string";
      if (typeof c.comment !== "string") throw "Comment must be of type string";
    });

    await this.addCommentIds(comments);

    let newTask = {
      title: title,
      description: description,
      hoursEstimated: hoursEstimated,
      completed: completed,
      comments: comments,
      _id: uuid.v4()
    };

    const taskCollection = await tasks();
    const insertInfo = await taskCollection.insertOne(newTask);
    if (insertInfo.insertedCount === 0) throw "Could not add task";

    const newId = insertInfo.insertedId;
    const task = await this.getTaskById(newId);
    return task;
  },

  //updates entire tasks with new data
  //how to update delta parameters
  async updateTask(id, title, description, hoursEstimated, completed) {
    if (!id) throw "Missing id parameter";

    let focus = await this.getTaskById(id);
    if (!title) title = focus.title;
    if (!description) description = focus.description;
    if (!hoursEstimated) hoursEstimated = focus.hoursEstimated;
    if (completed == undefined || completed == null)
      completed = focus.completed;

    if (typeof title !== "string") throw "Title must be a string";
    if (typeof description !== "string") throw "Description must be a string";
    if (typeof hoursEstimated !== "number")
      throw "Hours Estimated must be a number";
    if (typeof completed !== "boolean") throw "Completed must be a boolean";

    const taskCollection = await tasks();
    const updatedTask = {
      title: title,
      description: description,
      hoursEstimated: hoursEstimated,
      completed: completed
    };

    const updatedInfo = await taskCollection.updateOne(
      { _id: id },
      { $set: updatedTask }
    );

    if (updatedInfo.modifiedCount === 0)
      throw "could not update task successfully";

    return await this.getTaskById(id);
  },

  async addCommentIds(comments) {
    comments.forEach(c => {
      c.id = uuid.v4();
    });
  },

  async addComment(taskId, name, comment) {
    if (!taskId) throw "You must include a task id";
    if (!name) throw "You must include a name";
    if (!comment) throw "You must include a comment";

    if (typeof name !== "string") throw "name must be a string";
    if (typeof comment !== "string") throw "comment must be a string";

    let taskCollection = await tasks();

    let focus = await this.getTaskById(taskId);
    let gnu = [{ name: name, comment: comment }];
    await this.addCommentIds(gnu);
    focus.comments.push(gnu[0]);

    const updatedInfo = await taskCollection.updateOne(
      { _id: taskId },
      { $set: { comments: focus.comments } }
    );
    if (updatedInfo.modifiedCount === 0)
      throw "could not add comment successfully";

    return await this.getTaskById(taskId);
  },

  async removeComment(taskId, commentId) {
    if (!taskId) throw "You must provide a task id";
    if (!commentId) throw "You must provide a comment id";
    const task = await this.getTaskById(taskId);
    let tempComments = [];
    task.comments.forEach(comment => {
      if (comment.id !== commentId) {
        tempComments.push(comment);
      }
    });
    if (task.comments.length == tempComments.length) {
      throw "No comment with that id found";
    }
    const taskCollection = await tasks();
    const updatedInfo = await taskCollection.updateOne(
      { _id: taskId },
      { $set: { comments: tempComments } }
    );
    if (updatedInfo.modifiedCount === 0)
      throw "could not add comment successfully";

    return await this.getTaskById(taskId);
  }
};

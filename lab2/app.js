const express = require("express");
const path = require("path")
const app = express();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, ".", "/views/index.html"));
});

app.use("*", (req, res) => {
    res.sendStatus(404);
});

app.listen(3001, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3001");
});
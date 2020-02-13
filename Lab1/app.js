/*
 *I pledge my honor that I have abided by the Stevens Honor System.
 *Natalie Bernhard
 */
const express = require("express");
const app = express();
const configRoutes = require("./routes");
let accessed = {};
app.use(express.json());

app.use((req, res, next) => {
  let method = req.method;
  let route = req.originalUrl;
  let body = req.body;
  console.log(JSON.stringify(body) + " / " + method + " " + route);
  next();
});

app.use((req, res, next) => {
  let url = req.originalUrl;
  if (!accessed[url]) accessed[url] = 0;
  accessed[url]++;
  console.log(url + " has been accessed " + accessed[url] + " times.");
  next();
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});

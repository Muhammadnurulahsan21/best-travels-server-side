const express = require("express");
const app = express();
const port = 4000;


app.get("/", (req, res) => {
  res.send("Running my CRUD Server");
});


app.listen(port, () => {
  console.log("Running Server on port", port);
});

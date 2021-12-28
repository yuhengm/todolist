const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const items = [];
const workItems = [];

/* Default To-do list with title of current date */

app.get("/", function (req, res) {
  res.render("list", {
    listTitle: date.getDate(),
    newListItems: items,
  });
});

/* Work To-do list */

app.get("/work", function (req, res) {
  res.render("list", {
    listTitle: "Work",
    newListItems: workItems,
  });
});

/* About page */

app.get("/about", function (req, res) {
  res.render("about");
});

/* Handle post requests */

app.post("/", function (req, res) {
  // add item to default list
  let addedItem = req.body.newItem;
  items.push(addedItem);

  // post to work directory if needed
  if (req.body.list === "Work") {
    workItems.push(addedItem);
    res.redirect("/work");
  }
  // redirect to home
  else {
    res.redirect("/");
  }
});

app.listen(3000, function () {
  console.log("Server listening to port 3000.");
});

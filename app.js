const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {
  useNewUrlParser: true,
});

// Main list items
const itemSchema = { name: String };
const Item = mongoose.model("Item", itemSchema);

// default items, only need to add once!
const item1 = new Item({ name: "Love yourself 💕" });
const item2 = new Item({ name: "Sleep well 🛏" });
const item3 = new Item({ name: "Eat well 🍽" });
const defaultItems = [item1, item2, item3];

// new list documents for different pages
const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);

/* Default To-do list with title of current date */

app.get("/", function (req, res) {
  // find database and render corresponding info in list.ejs
  Item.find({}, function (err, foundItems) {
    // If nothing in default list, add default items
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(error) {
        if (error) {
          console.log(error);
        } else {
          console.log("successfully added default items");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: date.getDate(),
        newListItems: foundItems
      });
    }
  });
});

/* About page */

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/fail", function (req, res) {
  res.render("failure");
});


/* Custom-defined route */

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    } else {
      res.redirect("/fail");
    }
  });
});


/* Handle add post requests */

app.post("/", function (req, res) {
  // add item to database and ask home route to display results
  const inputItem = req.body.newItem;
  const listName = req.body.list;
  const addedItem = new Item({
    name: inputItem,
  });

  const today = date.getDate();

  if (listName === today) {
    addedItem.save();
    res.redirect("/");
  } else {
    console.log(today);
    console.log(listName);
    List.findOne({ name: listName }, function (err, foundList) {
      if (!err) {
        foundList.items.push(addedItem);
        foundList.save();
        res.redirect("/" + listName);
      } else {
        res.redirect("/fail");
      }
    });
  }
});

/* Handle delete post request */

app.post("/delete", function (req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;
  const today = date.getDate();

  if (listName === today) {
    Item.findByIdAndRemove(checkedItemID, function (err) {
      if (!err) {
        console.log("Successfully deleted item.");
        res.redirect("/");
      } else {
        res.redirect("/fail");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemID } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.post("/failure", function (req, res) { 
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Server listening to port 3000.");
});

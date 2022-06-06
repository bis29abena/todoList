//jshint esversion:6

//getting the required packages
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connecting to the mongoose database
mongoose.connect("mongodb://127.0.0.1:27017/todoListDB");

//creatig a new schema for mongo database
const itemSchema = new mongoose.Schema({
  name: String
})

//modelling the item Schema
const Item = mongoose.model("Item", itemSchema);

//Initialising the items schema and creating three collections
const item1 = new Item({
  name: "Welcome to your todo list"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  listItems: [itemSchema]
})

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {


  // Finding all the items in the Item Schema
  Item.find({}, function(err, result){
    if (err) {
      console.log(err);
    }else {

      if (result.length === 0) {
        // inserting many items to the Item schema
        Item.insertMany(defaultItems, function(err){
          if (err){
            console.log(err);
          }else {
            console.log("Items inserted to the Items table");
          }
        });
        res.redirect("/");
      }else {
        const day = date.getDate();

        res.render("list", {listTitle: day, newListItems: result});
      }

    }
  });


});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list;

  const addItem = new Item({
    name: item
  })

  if (listName === date.getDate()) {
    addItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.listItems.push(addItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === date.getDate()) {
    Item.findByIdAndRemove(checkItemID, function(err) {
      if (!err) {
        res.redirect("/")
      }
    });
  }else {
    List.findOneAndUpdate({name: listName}, {$pull: {listItems: {_id: checkItemID}}}, function(err, foundOne){
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/:todoActivity", function(req,res){
  const customeList = _.capitalize(req.params.todoActivity);

  List.findOne({name: customeList}, function(err, found){
    if (!err){
        //create a new list
        if (!found) {
          const list = new List({
          name: customeList,
          listItems: defaultItems
        });

          list.save()
          res.redirect("/" + customeList)
        }else {
          //show an existing list
          res.render("list", {listTitle: found.name, newListItems: found.listItems})
      }
    }

  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

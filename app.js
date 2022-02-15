//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { path } = require("express/lib/application");
const _ = require("lodash");
const { prototype } = require("tar/lib/pax");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://aungzawmyo:Aungzawmyo97@cluster0.sqsmh.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name : String
};

const ToDO = mongoose.model("item", itemsSchema);

const item1 = new ToDO({
  name: "Welcome to your todo list"
});

const item2 = new ToDO({
  name: "Hit the + button to add a new item."
});

const item3 = new ToDO({
  name: "<-- Hit the this to delete an item."
});

const defaultItems = [item1, item2, item3];


const listSchema = {
  name : String,
  items : [itemsSchema]
}

const List = mongoose.model("list", listSchema);


app.get("/", function(req, res) {

ToDO.find({}, function(err, foundItems){

  if(foundItems.length===0){
      ToDO.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("A Success!");
        }
      });
      res.redirect("/");
  }
  else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }

  
})

  

});

// ADD NEW LISTS TO NEW CUSTOM PATHS
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const inputItem = new ToDO({
    name : itemName
  });

  if(listName === "Today"){
    inputItem.save();

    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, elements){
      elements.items.push(inputItem);
      elements.save();
      res.redirect("/" + listName);
    });
  }

 
  
});

// DELETE POSTS //
app.post("/delete", function(req, res){

  const checkedItem = req.body.checkbox;
  const deleteList = req.body.listName;

  if(deleteList === "Today"){
    ToDO.findByIdAndRemove(checkedItem, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully deleted.");
        res.redirect("/");
      }
    });
  }
  else {
    List.findOneAndUpdate({name : deleteList}, {$pull : {items : {_id: checkedItem}}}, function(err, listFound){
      if(!err){
        res.redirect("/"+deleteList);
      }
    })
  }
  
  
  
});

// CUSTOM PATHS AND CREATE POSTS //
app.get("/:path", function(req, res){
  const customPath = _.capitalize(req.params.path);
  
  List.findOne({name : customPath}, function(err, foundList){
    if(!err){
      if(!foundList){
        // create a new list
        const list = new List({
          name : customPath,
          items : defaultItems
        });
        list.save();
        res.redirect("/" + customPath )
      }
      else {
        // show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items} )
      }
    }
  })

  

 
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully!);
});

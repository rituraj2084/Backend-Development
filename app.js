//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _=require("lodash");
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://rituraj_admin:Admin-123@cluster0.nqeor.mongodb.net/todolistDB",{useNewUrlParser:true});//creating and connecting to the database named "todolistDB"
const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);//creating a new collection named as items but we use singular here

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const item1=new Item({
  name:"Welcome to your todo list"
});

const item2=new Item({
  name:"Click + to add work list"
});

const item3=new Item({
  name:"Click checkbox to delete work"
});

const defaultItems=[item1,item2,item3];


const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
//const day = date.getDate();

Item.find({},function(err,foundItems){  //{} is the condition for finding all items in given collection
  if(foundItems.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Data successfully inserted");
      }
    });
    res.redirect("/");
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});
});

app.get("/:customListName",function(req,res){
  //console.log(req.params.customListName);//return the parameter "work" to terminal(localhost://3000/work)
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){//looking for list name if already exist then
    if(!err){
      if(!foundList){
        //console.log("Doesn't exist!");
        //create a new list
        const list=new List({ //new list is created in the "List" model in which name and defaultItems is already stored
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);//redirecting to route /customListName
      }else{
        //console.log("Exists!");
        //show existing list
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res){
  const checkedListid=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedListid,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Deleted successfully checked item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedListid}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

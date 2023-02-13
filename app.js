//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/tododb",{useNewUrlParser: true})

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = new mongoose.model("Item",itemsSchema)

const item1 = new Item({
  name: "Welcome to todo-list"
})
const item2 = new Item({
  name: "hit + button to add new tasks"
})
const item3 = new Item({
  name: "<-- hit this to remove the completed tasks"
})

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = new mongoose.model("List",listSchema)

app.get("/", function(req, res) {
  
  Item.find({},function(err,foundItems){
    if(err){
      console.log(err)
    }else{
      if(foundItems.length === 0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err)
          }
          res.redirect("/")
        })
      }
      res.render("list", {listTitle: "Today", newListItems: foundItems});

    }
  })
});

app.get("/:customList",function(req,res){
  const customList = req.params.customList
  List.findOne({name: customList},function(err,foundList){
    
      if(!foundList){
        const list = new List({
          name: customList,
          items: defaultItems
        })
        list.save();
        res.redirect("/"+customList)
      } else {
        res.render("list",{listTitle: req.params.customList, newListItems: foundList.items})
      }
  })
  
})

app.post("/",function(req,res){
  const itemName = req.body.newItem 
  const listName = req.body.list
  

  const newItem = new Item({
    name: itemName
  })
  List.findOne({name: listName},function(err,foundList){
    if(!err){
      foundList.items.push(newItem)
      foundList.save();
      res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
    }
    else {
      newItem.save();
      res.redirect("/")
    }
  })
  
  
})

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err)
      } else {
        res.redirect("/")
      }
    })
  } else {
    List.findOneAndUpdate({name: listName} , {$pull :{items: {_id: checkedItemId}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+foundList.name)
      }
    })
  }

  

})



app.listen(3000, function() {
  console.log("Server started on port 3000");
});

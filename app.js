const express=require("express")
const https=require("https")
const bodyParser=require("body-parser")
const app=express();
const mongoose = require("mongoose")
const _ =require("lodash")
app.use(express.static("public"))

//fRy3CHuvkVUdRuKb
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect("mongodb+srv://admin-rishwith:fRy3CHuvkVUdRuKb@cluster0.mzdjlia.mongodb.net/firstDB?retryWrites=true&w=majority",{useNewUrlParser:true})

const itemsSchema={
    name:String,
}

const Item=mongoose.model("Item", itemsSchema);

const item1=new Item({
    name:"Wekcome to your todolist!"
})

const item2=new Item({
    name:"Hit the button to off a new item"
})

const item3 = new Item({
    name:"Hit this check box to delete an item"
});

let date = new Date();

const options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

date = date.toLocaleString('en-IN', options);



const defaultItems=[item1,item2,item3]

const listSchema={
    name:String,
    items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/",function(req,res){ 

    Item.find({})
    .then(function(foundItems){
        if(foundItems.length == 0){
            Item.insertMany([item1,item2,item3])
                  .then(function(){
                         console.log("Sucessfully default items inserted")
                         });
                         res.redirect("/")
          }
          else{
        res.render("list",{listTitle:"Today "+date,newListItems:foundItems});
          }
    })

})

app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);
    
    List.findOne({name:customListName})
        .then(function(foundList){
            if(!foundList){
                const list = new List({name: customListName, items: defaultItems});
                list.save();
                 res.redirect('/'+customListName);
            }
            else{
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        })
})

app.post("/",function(req,res){
   const itemName=req.body.newItem;
   const listName = req.body.list;
   const newItem= new Item({
    name:itemName,
   })
   
   if(listName == "Today"){
    newItem.save();
    res.redirect("/");
   }
   else{
     List.findOne({name:listName})
         .then(function(foundList){
             foundList.items.push(newItem)
             foundList.save();
             res.redirect("/"+listName)
         })
   }
})

app.post("/delete",function(req,res){
    //console.log(req.body.checkbox);
    const checkedItemId=req.body.checkbox;
    const listName= req.body.listName;


    if(listName == "Today"){
        Item.findByIdAndRemove(checkedItemId)
        .then(function(){
            //yes deleted
            res.redirect("/"); 
        })
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull :{items:{_id:checkedItemId}}})
            .then(function(){
                //deleted
                res.redirect("/"+listName)
            })
    }
  

})

app.listen("3000",function(){
    console.log("Server started on port 3000")
})


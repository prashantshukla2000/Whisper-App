//jshint esversion:6
require('dotenv').config();
const express =require('express');
const ejs=require('ejs');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app= express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB",{useNewUrlParser: true});

const userSchema=new mongoose.Schema ({
 email:String,
 password:String
});

userSchema.plugin(passportLocalMongoose);

const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login")
  }
});
app.get("/logout",function(req,res){
  req.logout(function(err) {
   if (err) {
      console.log(err);
    }
   res.redirect('/');
 });
})

app.post("/register",function(req,res){
User.register({username: req.body.username}, req.body.password,function(err,user){
  if(err){
    console.log(err);
    res.redirect("/register");
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    });
  }
})
});

app.post("/login",function(req,res){
const user=new User({
  username:req.body.username,
  password:req.body.password
});
req.login(user,function(err){
  if(err){
    console.log(err);
  }else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    })
  }
})
});





app.listen(3000,function(){
  console.log("Server started at port 3000");
});

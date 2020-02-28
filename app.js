var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    app = express(),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");

// APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());//goes after body-parser

mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/restful_blog_app", {useNewUrlParser: true});

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: {type: String, default: "https://lh3.googleusercontent.com/proxy/nJdMR6CAIKKqbuzdH0HaZ2YofRUqHGAUV4rETTT_3GB6GiUf7AFnUk9puyE-gDKU8P_w_Z36UVqZzhv24jWqzrbKz0K8X8MLXgWalgmd5xr-QnkFAKRNRxfoGci8K5cUw2Bc6xo9e_wxetoScx73VD65P1iXGBXeZBppqc4zEg"},
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);
/* to create a new blog during developing th epage
Blog.create({
    title: "Test Blog",
    image: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=900&q=60",
    body: "HELLO THIS IS A BLOG POST!"
});
*/

// RESTUFL ROUTES
app.get("/", function(req, res){
    res.redirect("/blogs");
});
// INDEX ROUTE
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("ERROR!");
        }
        else{
            res.render("index", {blogs: blogs});
        }
    })
});
// NEW ROUTE
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res){
    //create blog
    //redirect
    //we have to sanatize req.body.blog.body
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        }
        else{
            res.redirect("/blogs");
        }
    });
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
    //find the corresponding blog
    var blog = Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("show", {blog: foundBlog});
        }
    });
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
    var blog = Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//DESTROY ROUTE
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs");
        }
    });
});

//listen
app.listen(3000, function(){
    console.log("Blog App is running");
});
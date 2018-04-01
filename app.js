var express        = require("express"),
    methodOverride = require("method-override"),
    expressSanitizer=require("express-sanitizer"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose")

mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type :Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

//RESTFUL ROUTE
// Blog.create({
//   title: "test blog",
//   image: "https://cdn.pixabay.com/photo/2017/02/01/22/02/mountain-landscape-2031539_960_720.jpg",
//   body: "hello this is a blog post"
// });
app.get("/blogs", function(req,res){
  Blog.find({},function(err,blogs){
    if(err){
      console.log("ERROR!");
    } else {
      res.render("index", {blogs: blogs});
    }
  });
});

app.get("/blogs/new", function(req,res){
  res.render("new");
});

app.post("/blogs", function(req,res){
  console.log(req.body);
  req.body.blog.body = req.sanitize(req.body.blog.body)
  console.log("=============");
  console.log(req.body);
  Blog.create(req.body.blog,function(err,newBlog){
    if(err){
      res.render("new");
    } else {
      res.redirect("/blogs");
    }
  });
});
app.get("/blogs/:id",function(req,res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect("/blogs");
    } else {
      res.render("show", {blog: foundBlog});
    }
  })
});
app.get("/blogs/:id/edit",function(req,res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect("blogs");
    } else {
      res.render("edit", {blog: foundBlog});
    }
  });
})

app.put("/blogs/:id",function(req,res){
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id,req.body.blog, function(err, updatedBlog){
    if(err){
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" +  req.params.id);
    }
  });
});

app.delete("/blogs/:id", function(req,res){
  //destroy blogs
  Blog.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect("/blogs")
    } else {
      res.redirect("/blogs");
    }
  })
});

app.listen(3000,process.env.IP, function(){
  console.log("Server is running");
});

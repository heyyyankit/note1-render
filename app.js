require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const userRoute = require("./routes/user");

const path = require("path");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const app = express();

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("MongoDB connected");
}).catch((err) => {
    console.log("MongoDB connection error:", err);
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // for parsing JSON bodies
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token")); // cookie name is token

const Note = require("./models/note");


app.use((req, res, next) => {
    res.locals.user = req.user || null;     // make user available in all views (no need to pass each time)
    next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function(){
    console.log("[heyyyankit] port started at 3000")
});

app.get("/", function(req, res){
    res.redirect("/user/signup");
});
app.get("/home", function(req, res){
    res.render("home", {
        user: req.user
    });
});

app.use("/user", userRoute); // localhost:3000/user/.....
// Separate these Notes related route in separate files like Users
app.get("/createNote", function(req, res){
    res.render("addNote");
})
var arr = [];   // title and body obj
var x;
var y;
app.post("/createNote", async function(req,res){
    x = String(req.body.x);
    y = String(req.body.y);
    // const note = {
    //     title: x,
    //     body: y
    // }
    if (!req.user) {
        return res.redirect("/user/signin");
    }
    await Note.create({
        title: x,
        body: y,
        createdBy: req.user._id // linking note with logged-in user (cant show all notes to all)
    });
    // arr.push(note);
    res.redirect("/createNote") // => .get
})

app.get("/notesList", async function(req, res){
    // const notes = await Note.find().populate('createdBy', 'name email'); // fetch notes with user details
    if (!req.user) {
        return res.redirect("/user/signin");
    }
    const notes = await Note.find({createdBy: req.user._id}).populate('createdBy', 'name email'); // fetch notes with user details
    res.render("allNotes", {arr: notes}); // => views/allNotes.ejs
})
// for viewNote (single) page, route by id
app.get("/notes/:id", async function(req, res){
    // const id = Number(req.params.id);
    // const note = arr[id];
    if (!req.user) {
        return res.redirect("/user/signin");
    }
    const note = await Note.findOne({ _id: req.params.id, createdBy: req.user._id }).populate('createdBy', 'name email');
    if (!note) {
        return res.status(404).send("Note not found");
    }
    res.render("viewNote", { note: note, id: note._id });
})
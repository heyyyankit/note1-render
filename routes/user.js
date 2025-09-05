const {Router} = require('express');
const User = require('../models/user');
const router = Router();

router.get("/signin", (req, res) => {
    console.log("Rendering signin page");
    res.render("signin");
});
router.get("/signup", (req, res) => {
    res.render("signup");
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

router.post("/signup", async (req, res) => {
    const {name, email, password} = req.body;
    // console.log(name, email, password);
    // const user = new User({name, email, password});
    await User.create({name, email, password});
    res.redirect("/user/signin");
});
router.post("/signin", async (req, res) => {
    console.log("Trying to signin")
    const {email, password} = req.body;
    try {
    const token = await User.matchPassword(email, password);
    console.log("User token:", token);
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/home");
    } catch (err) {
        // console.error("Error setting cookie:", err); 
        res.render("signin", { error: "Failed to set authentication cookie." });
        // return res.status(500).send("Internal Server Error");
    }
    // res.redirect("/");
    // if (!user) {        
    //     return res.status(400).send("User not found");
    // }
})
module.exports = router;

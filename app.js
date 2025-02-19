const express = require('express');
const app = express();
const userModel = require('./models/user');
const postModel = require('./models/post');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = require('./config/multerconfig');
const path = require('path')
require("dotenv").config();  // Load .env file
const PORT = process.env.PORT || 3000;




app.set("view engine", 'ejs')
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


app.get('/', function (req, res){
    res.render('index')
})

app.get('/profile/upload', function (req, res){
    res.render('profileupload')
})
app.post('/upload', isLoggedIn, upload.single("image"), async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect('/profile');
    
})
app.get('/profile', isLoggedIn, async (req, res) => {
    try {
        if (!req.user || !req.user.email) {
            return res.redirect('/login'); // Redirect if user not found
        }

        let user = await userModel.findOne({ email: req.user.email }).populate("posts");

        // If user is null, send an empty object with default values
        if (!user) {
            user = { name: "Guest", profilepic: "default.jpg", posts: [] };
        }

        res.render('profile', { user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/post', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });

    if (!user) return res.status(400).send("User not found");

    // ✅ Await the post creation
    let post = await postModel.create({
        user: user._id,
        content: req.body.content
    });

    // ✅ Push post ID to user's posts array
    user.posts.push(post._id);
    await user.save();

    res.redirect("/profile");
});

app.get('/edit/:id', isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({_id: req.params.id}).populate("user");
    res.render('edit' , {post});

})
app.post('/update/:id', isLoggedIn, async (req, res) => {
    try {
        // Find the post by ID
        let post = await postModel.findById(req.params.id);
        if (!post) {
            return res.status(404).send("Post not found");
        }

        // Update post content
        post.content = req.body.content;
        await post.save();

        // Redirect to profile after update
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

app.post('/like/:id', isLoggedIn, async (req, res) => {
    try {
        let post = await postModel.findOne({ _id: req.params.id });

        if (!post) return res.status(404).send("Post not found");

        let likeIndex = post.likes.indexOf(req.user.userid);

        if (likeIndex === -1) {
            post.likes.push(req.user.userid);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        res.redirect("/profile");
    } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).send("Server error");
    }
});


app.post('/register', async function (req, res){
    const {username, name, email, password, age} = req.body;
    let user = await userModel.findOne({email})
    // If user alredy exist
    if(user) return res.send(500).send("User already registerd")

        bcrypt.genSalt(10, (err, salt)  => {
            bcrypt.hash(password, salt, async (err, hash) =>{
                let user = await userModel.create({
                    username,
                    name,
                    age,
                    email,
                    password: hash,
                });
                let token = jwt.sign({email: email, userid: user._id},"Moosa");
                res.cookie("token", token);
                res.redirect("/profile");

            })

        })
})
app.get('/login', function (req, res){
    res.render('login')
})
app.post('/login', async (req, res) =>{
    const { email, password} = req.body;

    let user = await userModel.findOne({email});
    if(!user) return res.status(500).send("Some thing went wrong");

    bcrypt.compare(password, user.password, function (err, result){
        if(result){
           
            let token = jwt.sign({email: email, userid: user._id},"Moosa");
            res.cookie("token", token);
            res.status(200).redirect("/profile");
        }
        else res.redirect("/login")

    });
});
app.get('/logout', function (req, res){
    res.cookie("token",     "");
    res.redirect('/login')
})

function isLoggedIn(req, res, next) {
    if (!req.cookies || !req.cookies.token) {
        return res.redirect('/login');
    }

    try {
        let data = jwt.verify(req.cookies.token, "Moosa");
        req.user = data;
        next();
    } catch (error) {
        res.redirect('/login');
    }
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
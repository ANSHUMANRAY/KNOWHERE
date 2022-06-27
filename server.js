const express = require('express');
const UserModel = require('./user');
const { hashSync, compareSync, compare } = require('bcrypt');
const User = require('./user');
const jwt = require('jsonwebtoken');
const passport = require('passport')
require('./passport');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.post('/register', (req, res) => {
    const newUser = new User({
        username: req.body.username,
        password: hashSync(req.body.password, 10)
    })

    User.findOne({ username : req.body.username })
    .then(user => {
        if(user) {
            return res.status(409).send({
                success : false, 
                message : "Username already exists"
            })
        }
    })

    newUser.save()
        .then(user => {
            res.send({
                success: true,
                message: "User Created Successfully",
                user: {
                    id: user._id,
                    username: user.username
                }
            })
        })
        .catch(err => {
            res.send({
                success : false, 
                message: "Something went wrong", 
                error : err
            })
        })
})

app.post('/login', (req, res) => {
    User.findOne({ username : req.body.username })
    .then(user => {

        //No user found
        if(!user) {
            res.status(401).send({
                success : false, 
                message : "username doesn't exist"
            })
        }

        //incorrect password
        if(!compareSync(req.body.password, user.password)) {
            res.status(401).send({
                success : false, 
                message : "Incorrect Password"
            })
        }

        const payload = {
            username : user.username, 
            id : user._id
        }

        const token = jwt.sign(payload, "secret", {expiresIn : "1d"});

        return res.status(200).send({
            success : true, 
            message : "User logged in successfully", 
            token : "Bearer " + token
        })
    })
})

app.get('/home', passport.authenticate('jwt', {session:false}), (req, res) => {
    res.status(200).send({
        success:true, 
        user: {
            id:req.user._id, 
            username: req.user.username
        }
    })
})

app.listen(3000, () => console.log("Listening to port 3000"));

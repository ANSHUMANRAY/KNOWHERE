const express = require('express');
const UserModel = require('./user');
const { hashSync, compareSync } = require('bcrypt');
const User = require('./user');
const jwt = require('jsonwebtoken');
const passport = require('passport')
const sendMail = require('./mailer');
const { decodeToken } = require('./utils');
require('./passport');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.post('/register', (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashSync(req.body.password, 10),
        verified: false
    })

    User.findOne({ username: req.body.username })
        .then(user => {
            if (user) {
                return res.status(409).send({
                    success: false,
                    message: "Username already exists"
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
                success: false,
                message: "Something went wrong",
                error: err
            })
        })
})

app.post('/login', (req, res) => {
    User.findOne({ username: req.body.username })
        .then(user => {

            //No user found
            if (!user) {
                res.status(401).send({
                    success: false,
                    message: "username doesn't exist"
                })
            }

            //incorrect password
            if (!compareSync(req.body.password, user.password)) {
                res.status(401).send({
                    success: false,
                    message: "Incorrect Password"
                })
            }

            const payload = {
                username: user.username,
                id: user._id
            }

            const token = jwt.sign(payload, "secret", { expiresIn: "1d" });

            return res.status(200).send({
                success: true,
                message: "User logged in successfully",
                token: "Bearer " + token
            })
        })
})

app.get('/home', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.status(200).send({
        success: true,
        user: {
            id: req.user._id,
            username: req.user.username
        }
    })
})

app.get('/verifyEmail', passport.authenticate('jwt', { session: false }), (req, res) => {

    User.findOne({ username: req.user.username })
        .then(user => {
            console.log("in then");
            let token = jwt.sign({username: req.user.username}, "secretVerify", { expiresIn: "10m" });
            let text = "http://localhost:3000/verify/" + token;
            console.log(text);
            sendMail({ text: text, to: user.email });
            res.sendStatus(200);
        })
        .catch(err => {
            res.send({
                success: false, 
                error: err
            })
        })
})

app.get("/verify/:token", (req, res) => {
    console.log(req.params.token);
    let payload = decodeToken(req.params.token, "secretVerify");
    User.updateOne({ username: payload.username }, { $set: { verified: true } })
        .then(user => {
            res.status(200).send({
                success: true,
                message: "User verified successfully", 
                user: user
            })
        })
        .catch(err => {
            res.status(401).send({
                success: false, 
                error: err
            })
        })

})

app.post('/forgotPassword', (req, res) => {
    console.log(req.body.username);
    User.findOne({username : req.body.username})
    .then(user => {
        let token = jwt.sign({ username: user.username }, "passwordChange", {expiresIn: "10m"});
        let text = "http://localhost:3000/setPassword/" + token;
        sendMail({text: text, to:user.email});
        res.status(200).send({
            success: true, 
            message: "link sent to your email"
        })
    })
    .catch(err => {
        res.status(401).send({
            success: false, 
            message: "No user found", 
            error: err
        })
    })
})

app.get('/setPassword/:token', (req, res) => {
    let payload = decodeToken(req.params.token, 'passwordChange');
    res.status(200).send({
        success: true, 
        username: payload.username
    })
})

app.post('/setPassword/:token', (req, res) => {
    let username = decodeToken(req.params.token, "passwordChange");
    username = username.username;
    User.findOne({ username : username})
    .then(_user => {
        let hashedPassword = hashSync(req.body.password, 10);
        console.log(hashedPassword);
        console.log(_user.password);
        User.updateOne({username : username}, {$set : {password : hashedPassword}})
        .then(user => {
            res.status(200).send({
                success: true, 
                message: "password changed successfully",
                user: user
            })
        })
        .catch(err => {
            res.status(500).send({
                success: false, 
                message: "something wrong in changing the password",
                error: err
            })
        })
    })
    .catch(err => {
        res.status(401).send({
            success: false, 
            message: "User not verified", 
            error: err
        })
    })
})

app.listen(3000, () => console.log("Listening to port 3000"));

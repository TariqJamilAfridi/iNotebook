const express = require('express');
const router = express.Router();
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser')
const JWT_SECRET = process.env.JWT_SECRET;
//signup route
router.post(
    '/createuser',
    [
        body('name', 'Enter a valid name minimum length is 3 characters')
            .isLength({ min: 3 }),

        body('email', 'Enter a valid email address')
            .isEmail(),

        body('password', 'Enter a valid password at least 5 characters long')
            .isLength({ min: 5 })
    ],
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        try {
            let user = await User.findOne({
                email: req.body.email
            });

            if (user) {
                return res.status(400).json({
                    error: 'Sorry, a user with this email already exists'
                });
            }

            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);
            user = await User.create({
                name: req.body.name,
                password: secPass,
                email: req.body.email
            });
            const data = {
                user: {
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            console.log(authtoken);
            res.json({ authtoken });

            // Send response to Postman
            //           res.status(201).json({
            //                success: true,
            //               message: 'User created successfully',
            //             user: user
            //       });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
);
//signin route
router.post(
    '/login',
    [
        body('email', 'Enter a valid email address')
            .isEmail(),

        body('password', 'Password cannot be blank')
            .exists(),
    ],
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        console.log(req.body);
        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({
                    error: "Please try to login with correct credentials"
                })
            }
            const passwordCompare = await bcrypt.compare(
                req.body.password,
                user.password
            );
            if (!passwordCompare) {
                return res.status(400).json({
                    erroe: "Plese try to login with correct credentials"
                })
            }
            const data = {
                user: {
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            res.json({ authtoken });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
)
//get user details
router.post(
    '/getuser', fetchuser, async (req, res) => {
        try {
            userId = req.user.id;
            const user = await User.findById(userId).select("-password");
            res.send(user);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

)
module.exports = router;


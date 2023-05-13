import {validationResult} from "express-validator";
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const password = req.body.password
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash
        })

        const user = await doc.save()

        const token = jwt.sign({
                _id: user._id
            },
            'secret123',
            {
                expiresIn: '30d'
            }
        )

        const {passwordHash, ...userData} = user._doc // Pull the password property from the user object and then use user as userData

        res.json({ // return the user object without password
            ...userData,
            token
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Failed to register'
        })
    }
}

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({email: req.body.email})

        if (!user) { // If the user is not found
            return res.status(404).json({
                message: 'Incorrect login or password'
            })
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash) // comparing the password from the DB and the one written by the user

        if (!isValidPass) { // if incorrect password
            return res.status(400).json({
                message: 'Incorrect login or password'
            })
        }

        const token = jwt.sign({ // If the authorization is successful
                _id: user._id
            },
            'secret123',
            {
                expiresIn: '30d'
            }
        )

        const {passwordHash, ...userData} = user._doc // Pull the password property from the user object and then use user as userData

        res.json({ // return the user object without password
            ...userData,
            token
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Failed to log in'
        })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }
        const {passwordHash, ...userData} = user._doc // Pull the password property from the user object and then use user as userData
        res.json(userData)
    } catch (err) {
        return res.status(404).json({
            message: 'No access'
        })
    }
}
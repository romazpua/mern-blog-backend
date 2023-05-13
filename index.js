import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import cors from 'cors'
import { registerValidation, loginValidation, postCreateValidation } from './validations.js'
import { checkAuth, handleValidationErrors } from './utils/index.js'
import { UserController, PostController } from './controllers/index.js'


mongoose.connect( 'mongodb+srv://romazpua:GQo0X2wu4afwEh2S@cluster0.wcwgw.mongodb.net/blog?retryWrites=true&w=majority' )
.then( () => console.log( 'DB Ok' ) )// if success connection to DB
.catch( ( err ) => console.log( 'DB error', err ) ) // if error in connection to DB

const app = express()

const storage = multer.diskStorage( {
    destination: ( _, __, cb ) => { // The function which will save files in the 'uploads' folder
        cb( null, 'uploads' )
    },
    filename: ( _, file, cb ) => { // The function that will name the files
        cb( null, file.originalname )
    }
} )

const upload = multer( { storage } )

app.post( '/upload', checkAuth, upload.single( 'image' ), ( req, res ) => {
    res.json( {
        url: `/uploads/${ req.file.originalname }`
    } )
} )

app.use( '/uploads', express.static( 'uploads' ) )
app.use( cors() )
app.use( express.json() ) // for Express understand JSON

app.post( '/auth/login', loginValidation, handleValidationErrors, UserController.login )
app.post( '/auth/register', registerValidation, handleValidationErrors, UserController.register )
app.get( '/auth/me', checkAuth, UserController.getMe )

app.get( '/tags', PostController.getLastTags )
app.get( '/posts/tags', PostController.getLastTags ) // Get all tags
app.get( '/posts', PostController.getAll ) // Get all articles
app.get( '/posts/:id', PostController.getOne ) // Get one article
app.post( '/posts/', checkAuth, postCreateValidation, handleValidationErrors, PostController.create ) // Create an article
app.delete( '/posts/:id', checkAuth, PostController.remove ) // Remove an article
app.patch( '/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update ) // Update an article

app.listen( 4444, ( err ) => {
    if ( err ) return console.log( err )
    console.log( 'Server OK' )
} )


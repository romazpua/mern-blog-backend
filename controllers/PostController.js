import PostModel from '../models/Post.js'
import e from 'express';

export const getLastTags = async ( req, res ) => {
    try {
        const posts = await PostModel.find().limit( 5 ).exec()

        const tags = posts.map( obj => obj.tags ).flat().slice( 0, 5 )

        res.json( tags )
    } catch ( err ) {
        console.log( err )
        res.status( 500 ).json( {
            message: 'Failed to get articles'
        } )
    }
}
export const getAll = async ( req, res ) => {
    try {
        const posts = await PostModel.find().populate( 'user' ).exec()
        res.json( posts )
    } catch ( err ) {
        console.log( err )
        res.status( 500 ).json( {
            message: 'Failed to get articles'
        } )
    }
}
export const getOne = async ( req, res ) => {
    try {
        const postId = req.params.id // Get the ID of the desired article from the query params
        PostModel.findOneAndUpdate(
            { _id: postId, },
            { $inc: { viewsCount: 1 }, },// Update the number of views
            { returnDocument: 'after', }// Return document after update
        )
        .then( ( doc ) => {
            if ( !doc ) {
                return res.status( 404 ).json( {
                    message: 'Article not found'
                } )
            }
            res.json( doc )
        } )
    } catch ( err ) {
        console.log( err )
        res.status( 500 ).json( {
            message: 'Failed to get articles'
        } )
    }
}
export const remove = async ( req, res ) => {
    try {
        const postId = req.params.id // Get the ID of the desired article from the query params

        PostModel.findOneAndDelete( {
            _id: postId
        } ).then( ( doc ) => {
            if ( !doc ) {
                return res.status( 404 ).json( {
                    message: 'No article was found'
                } )
            }
            res.json( {
                success: true
            } )
        } )

    } catch ( err ) {
        console.log( err )
        res.status( 500 ).json( {
            message: 'Failed to get articles'
        } )
    }
}
export const create = async ( req, res ) => {
    try {
        const doc = new PostModel( {
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.userId
        } )

        const post = await doc.save()
        res.json( post )
    } catch ( err ) {
        console.log( err )
        res.status( 500 ).json( {
            message: 'Failed to create an article'
        } )
    }
}
export const update = async ( req, res ) => {
    try {
        const postId = req.params.id
        await PostModel.updateOne( {
                _id: postId
            },
            {
                title: req.body.title,
                text: req.body.text,
                imageUrl: req.body.imageUrl,
                user: req.userId,
                tags: req.body.tags
            }
        )

        res.json( {
            success: true
        } )
    } catch ( err ) {
        console.log( err )
        res.status( 500 ).json( {
            message: 'Failed to update an article'
        } )
    }
}

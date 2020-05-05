var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');
const validator = require('express-validator');

// Display list of all Genre.
exports.genre_list = function(req, res) {
    Genre.find() 
    // .sort({name:-1})
    .exec(function(err,genre_list)
    {
        if(err) {return next(err);}
        res.render('genre_list', {title: 'Genres', list_genres: genre_list});
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {
    async.parallel({
        genre: function(callback){
            Genre
            .findById(req.params.id)
            .exec(callback);
        },
        genre_books: function(callback){
            Book
            .find({'genre':req.params.id})
            .exec(callback);
        },
    }, 
    function(err, results)
    {
        if(err) {return next(err); }
        if(results.genre == null){
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        res.render('genre_detail', {title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books});

    });
   // res.send('NOT IMPLEMENTED: Genre detail: ' + req.params.id);
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form', {title: 'Create Genre'});
};

// Handle Genre create on POST.
exports.genre_create_post = [
    
    //validate that the name field is not empty 
    validator.body('name', 'Genre name required').trim().isLength({min:1}),
    
    //sanitize (escape) the name field.
    validator.sanitizeBody('name').escape(),
    
    //process request after validation and sanitization
    (req, res, next) =>{

        //extract the validation errors from a request.
        const errors = validator.validationResult(req);
    
        //create a genre object with escaped and trimmed data.
        var genre = new Genre(
            {name: req.body.name}
        );

        if(!errors.isEmpty()){
            res.render('genre_form', {title: 'Create Genre', genre:genre, errors:errors.array()});
            return;
        }
        else{
            Genre.findOne({'name':req.body.name})
            .exec(function(err, found_genre)
            {
                if(err){return next(err);}
                if(found_genre){
                    res.redirect(found_genre.url);
                }
                else{
                    genre.save(function(err)
                    {
                        if(err){return next(err);}
                        res.redirect(genre.url);
                    });
                }
            });
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {
    async.parallel({
        genre: function(callback){
            Genre.findById(req.params.id).exec(callback);
        },
        books: function(callback){
            Book.find({'genre':req.params.id}).exec(callback);
        } 
    }, function(err, results){
        if(err){return next(err);}
        res.render('genre_delete',{
            title: results.genre.name,
            genre: results.genre,
            books: results.books,
        });
    });
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res, next) {
    async.parallel({
        genre: function(callback){
            Genre.findById(req.body.genreid).exec(callback);
        },
        books: function(callback){
            Book.find({'genre':req.body.genreid}).exec(callback);
        },
    }, function(err, results){
        if(err) {return next(err);}
        
        if(results.books > 0){
            res.render('genre_delete',{
                title: results.genre.name,
                genre: results.genre,
                books: results.books,
            });
        }
        else{
            Genre.findByIdAndRemove(req.body.genreid, function(err){
                if(err){return next(err);}
                res.redirect('/catalog/genres');
            }); 
        }
    });
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next) {
    async.parallel({
        genre: function(cb){
            Genre.findById(req.params.id).exec(cb);
        },
        // books: function(cb){
        //     Book.find({genre:req.params.id}).exec(cb);
        // }
    }, function(err, results){
        if(err) {return next(err);}
        
        res.render('genre_form',{
            title: 'Update ' + results.genre.name,
            genre: results.genre, 
            //books: results.books,
        });
    });
    //res.send('NOT IMPLEMENTED: Genre update GET');

};

// Handle Genre update on POST.
exports.genre_update_post = [
    validator.body('name', 'Genre name required').trim().isLength({min:1}),
    validator.sanitize('name').escape(),
    (req, res, next) => {
        Genre.findByIdAndUpdate(req.params.id, {name: req.body.name}, {}, function(err, results){
            if(err) {return next(err);}
            res.redirect('/catalog/genre/' + req.params.id);
        });
    }
];



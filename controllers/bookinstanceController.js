var BookInstance = require('../models/bookinstance');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Book = require('../models/book');
async = require('async');

exports.bookinstance_list = function(req,res){
    BookInstance.find()
    .populate('book')
    .exec(function(err, list_bookinstances){
        if(err){return next(err);}
        res.render('bookinstance_list', {title: 'Book Instance List', bookinstance_list: list_bookinstances});
    });
    //res.send('NOT IMPLEMENTED: BookInstance list');
};

exports.bookinstance_detail = function(req,res,next){
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, bookinstance)
    {
        if(err){return next(err)};
        if(bookinstance==null){
            var err = new Error('Book copy not found');
            err.status = 404;
            return next(err);
        }
        res.render('bookinstance_detail', {title: 'Copy:' + bookinstance.book.title, bookinstance: bookinstance});
    });
};

exports.bookinstance_create_get = function(req,res){
    Book.find({}, 'title')
    .exec(function(err, books){
        if(err) {return next(err);}
        res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books});
    });
};


// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    body('book', 'Book must be specified').trim().isLength({ min: 1 }),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),

    //Process request after validation and sanitization
    (req, res, next) => {
        //Extract the validation errors from a request
        const errors = validationResult(req);

        var bookinstance = new BookInstance(
            {
            book:req.body.book,
            imprint: req.body.imprint,
            status:req.body.status,
            due_back:req.body.due_back
            });

        if(!errors.isEmpty()){
            Book.find({},'title')
            .exec(function(err, books){
                if(err) {return next(err);}
                res.render('bookinstance_form', {
                    title: 'Create BookInstance', 
                    book_list: books, 
                    selected_book: bookinstance.book_.id, 
                    errors:errors.array(),
                    bookinstance:bookinstance});
            });
            return;
        }
        else{
            bookinstance.save(function(err){
                if(err) {return next(err);}
                res.redirect(bookinstance.url);
            });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, bookinstance)
    {
        if(err) {return next(err);}
        res.render('bookinstance_delete', {title: "Book Instance: " + bookinstance.id, bookinstance: bookinstance, book: bookinstance.book});

    });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res, next) {
    
    BookInstance.findByIdAndDelete(req.body.bookinstanceid)
    .exec(function(err, bookinstance){ 
        if(err){return next(err);}
        res.redirect('/catalog/bookinstances');
    }); 
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res, next) {
    async.parallel({
        bookinstance:function(cb){
            BookInstance
            .findById(req.params.id)
            .exec(cb);
        },
        books:function(cb){
            Book
            .find({},'title')
            .exec(cb);
        },

    }, function(err, results){
        if(err) {return next(err);}
        
        res.render('bookinstance_form', {
            title: "Update BookInstance",
            bookinstance: results.bookinstance,
            book_list: results.books,
        });
    });   
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    body('book', 'book required').trim().isLength({min:1}),
    body('imprint', 'imprint required').trim().isLength({min:1}),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('due_date').toDate(),
    sanitizeBody('status').trim().escape(),


    (req, res, next) =>{
       
        const errors = validationResult(req);
        if(!errors.isEmpty())
        { 
             
            async.parallel({
                //The book fetch below, is to check 
                //that book ID provided is valid
                book: function(cb){
                    Book
                    .findById(req.body.id)
                    .exec(cb);
                },
                books: function(cb){
                    Book
                    .find({},'title')
                    .exec(cb);
                },
                bookinstance:function(cb){
                    BookInstance
                    .findById(req.params.id)
                    .exec(cb);
                }
            }, function(err, results){
                if(err) {return next(err);}

                res.render('bookinstace_form',{
                    title: 'Update BookInstance',
                    bookinstance: results.bookinstance,
                    books: results.books,
                    selected_book: results.book._id,
                    errors: errors.list(),
                });
            });
        }
        else
        { 
            
            BookInstance.findOneAndUpdate(
              
                req.params.id, {
                    book: req.body.book,
                    imprint: req.body.imprint,
                    due_back: req.body.due_back, 
                    status: req.body.status,
                },  
                {},
                function(err, bookinstance){
                    
                    if(err) {next(err);} 
                   
                    res.redirect(bookinstance.url);
            });
        }
    }
];
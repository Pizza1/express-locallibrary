var BookInstace = require('../models/bookinstance');

exports.bookinstance_list = function(req,res){
    res.send('NOT IMPLEMENTED: BookInstance list');
};

exports.bookinstance_detail = function(req,res){
    res.send('NOT IMPLEMENTED: BookInstance detail: ' + req.params.id);
};

exports.bookinstance_create_get = function(req,res){
    res.send('NOT IMPLEMENTED: Book Instance create GET');
};


// Handle BookInstance create on POST.
exports.bookinstance_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance create POST');
};

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};
var express = require('express');
var router = express.Router();
var users = require('../controllers/users')

/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session.userId) {
        res.render('index', { title: 'Express', user: req.session.login });
    }
    else {
        res.redirect('/login');
      
    }
});
router.get('/dashboard', function (req, res, next) {
    if (req.session.userId) {
        res.render('index', { title: 'Express', user: req.session.login });
    }
    else {
        res.redirect('/login');
      
    }
});
// router.get('/confirmation/:id', task.confirmation);
router.post('/signup', users.addUser);
router.get('/logout', users.logout);
router.post('/login', users.loginCustomer);
router.get('/login',users.loginPage);




module.exports = router;

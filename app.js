let express = require('express');
let morgan = require('morgan');
let bodyParser = require('body-parser');
let path = require('path');
let expressValidator = require('express-validator');
let mongoose = require('mongoose');
let errorhandler = require('errorhandler');
let session = require('express-session');

let indexRoute = require('./routes');


let isProduction = process.env.NODE_ENV === 'production';

/* creating global app object */
let app = express();

 /* usual express configuration */
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'/public')));
app.use(session({secret:"super secret", cookie:{maxAge:60000}, resave:false, saveUninitialized:false}));

// require('./models/User');
app.use(indexRoute);

if(!isProduction) {
    app.use(errorhandler());
}

if(isProduction) {
    mongoose.connect(process.env.MONGODB_URI);
} else {
    mongoose.connect('mongodb://localhost:27017/airtime',{ useNewUrlParser: true });
    mongoose.set('debug', true);
}

/* catch 404 and forward to error handllers */

app.use(function(req, res, next) {
    let err = new Error('Not found');
    err.status = 404;
    next(err);
});

/* development error handllers */
if(!isProduction) {
    app.use(function(req, res, next) {
        console.log(err.stack);
        res.status(err.status || 500);
        res.json({
            'errors':{
                message:err.message,
                error:{}
            }
        });
    });
}

/* production error handllers */

app.use(function(req, res, next) {
    res.status(err.status || 500);
    res.json({
        'errors':{
            message:err.message,
            error:{}
        }
    });
});

/* Finally we start our server */
let server = app.listen(process.env.PORT || 8000, function(){
    console.log('Listening on port '+ server.address().port);
});


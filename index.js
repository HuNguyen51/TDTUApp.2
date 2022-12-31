const path = require('path')
const express = require('express');
const handlebars = require('express-handlebars')
const cors = require('cors')

const flash = require('express-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const credentials = require('./credentials');

var bodyParser = require('body-parser');

const app = express()
app.use(express.json())
app.use(cors())

app.use(express.static(path.join(__dirname, 'public')))

// parsing application/json
app.use(bodyParser.json()); 
//  parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 


//Template emgine
app.engine('hbs', handlebars.engine({
    extname: '.hbs',
    //helpers: helpers
}))

app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: credentials.cookieSecret,
    })
);
app.use(cookieParser());
app.use(flash());

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

const route = require('./routes')

route(app)

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Server start at: http://localhost:${port}`))
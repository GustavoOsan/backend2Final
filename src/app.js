const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const initializePassport = require('./config/passport.config');
const { dbConnection } = require('./config/dbConnection');
require('dotenv').config(); 

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const sessionsRouter = require('./routes/sessions.router');
const viewsRouter = require('./routes/views.router');
const app = express();
const PORT = process.env.PORT || 8080;

dbConnection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); 

initializePassport();
app.use(passport.initialize());
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/', viewsRouter);

app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
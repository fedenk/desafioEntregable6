import express from 'express';
import session from 'express-session';
import {__dirname} from './utils.js';
import handlebars from 'express-handlebars';
import MongoStore from 'connect-mongo';
import sessionsRouter from './routes/sessions.router.js';
import viewsRouter from './routes/views.router.js';
import mongoose from 'mongoose';
import { initializePassport } from './config/passport.config.js';
import passport from 'passport';

try {
    await mongoose.connect('mongodb+srv://fedenkoptv:86VUQzMmgjkJQ26Z@cluster55575fgs.es4ndyh.mongodb.net/desafioEntregable6?retryWrites=true&w=majority');
    console.log('DB connected');
} catch (error) {
    console.log(error.message);
}

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(`${__dirname}/public`));

app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');

app.use(session({
    store: MongoStore.create({
        client: mongoose.connection.getClient(),
        ttl: 3600
    }),
    secret: 'Coder55755Secret',
    resave: true,
    saveUninitialized: true,
}));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use('/', viewsRouter);
app.use('/api/sessions', sessionsRouter);

app.listen(8080, ()=> console.log('Server Running'));
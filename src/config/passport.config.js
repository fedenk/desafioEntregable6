import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';
import usersModel from '../dao/models/users.model.js';
import { createHash, isValidPassword } from '../utils.js';

const LocalStrategy = local.Strategy;

const initializePassport = () => {

    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email'
    }, async (req, username, password, done) => {
        try {
            const { first_name, last_name, age } = req.body;
            const user = await usersModel.findOne({ email: username });

            if(user) {
                return done(null, false);
            }

            const userToSave = {
                first_name,
                last_name,
                email: username,
                age,
                password: createHash(password)
            }

            const result = await usersModel.create(userToSave);
            return done(null, result);

        } catch (error) {
            return done(`Incorrect Credentials`);
        }
    }));

    passport.use('login', new LocalStrategy({
        usernameField: 'email'
    }, async (username, password, done) => {
        try {
            const user = await usersModel.findOne({ email: username });

            if(!user || !isValidPassword(password, user.password)) {
                return done(null, false);
            }

            return done(null, user);

        } catch (error) {
            return done(`Incorrect Credentials`);
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async(id, done) => {
        const user = await usersModel.findById(id);
        done(null, user);
    });

    //Github

    passport.use('github', new GitHubStrategy({
        clientID: 'Iv1.034d81e5f4e93b61',
        clientSecret: '4398fe45df78cf400104257a2d9f57998f4577ae',
        callbackURL: 'http://localhost:8080/api/sessions/github-callback',
        scope: ['user:email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile);
            const email = profile.emails[0].value;
            const user = await usersModel.findOne({email});

            if(!user){
                const newUser = {
                    first_name: profile._json.name,
                    last_name: '',
                    age: 18,
                    email,
                    password: ''
                }

                const result = await usersModel.create(newUser);
                return done(null, result);
            }else{
                return done(null, user);
            }
        } catch (error) {
            return done(`Incorrect credentials`);
        }
    }))
}

export {
    initializePassport
}
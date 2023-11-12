const express = require('express');
const passport = require('passport');
const session = require('express-session');
const User = require('./User');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;


const app = express();

app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy(
      {
        clientID: '752847050713-jkg2478vae1245abgmc34m963s2uvg6l.apps.googleusercontent.com',  //process.env.GOOGLE_CLIENT_ID,
    clientSecret: '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',   //process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ where: { googleId: profile.id } });
  
          if (!user) {
            // If the user does not exist, create a new one
            user = await User.create({
              email: profile.emails[0].value,
              role: 'user', // Adjust the role as needed
              googleId: profile.id,
            });
          }
  
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  
  // Passport configuration for local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ where: { email: username } });
  
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
  
        const isValidPassword = await bcrypt.compare(password, user.password);
  
        if (!isValidPassword) {
          return done(null, false, { message: 'Incorrect password.' });
        }
  
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  
  // Serialization and deserialization of user
  passport.serializeUser((user, done) => {
    done(null, user.email);
  });
  
  passport.deserializeUser(async (email, done) => {
    try {
      const user = await User.findByPk(email);
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });


// Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  });

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  });

  app.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

app.get('/api/user', (req, res) => {
  res.json(req.user);
});


// Protect some routes with authentication middleware
const isAuthenticated = (req, res, next) => {
    console.log(req)
  if (req.isAuthenticated()) {
    return next();
  }
  console.log('failed')
  res.redirect('/');
};

app.get('/protectedroute', isAuthenticated, (req, res) => {
  res.send('This is a protected route');
});

app.get('/', (req, res) => {
    res.send('Hello World');
  });
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
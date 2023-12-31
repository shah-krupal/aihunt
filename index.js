const express = require('express');
const passport = require('passport');
const session = require('express-session');
const User = require('./User');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const cors = require('cors');
const sequelize = require('./config/database.js');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const Sessions = require('./Session');
const cookieSession = require('cookie-session');


const app = express();
const corsOptions = {
  origin: 'https://producthunt-frontend.vercel.app', // Replace with your frontend's actual domain
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Enable set cookie
};

app.use(cors(corsOptions));

// app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true, store: new SequelizeStore({
//   db: sequelize,
//   table: 'Session',
// }), cookie: {
//   httpOnly: true,
//   secure: true, // Set to true in production if using HTTPS
//   maxAge: 3600000, // Session duration in milliseconds
// }, }));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  secure: true, // Set to true in production if using HTTPS
  httpOnly: true,
}));

app.use((req, res, next) => {
  if (!req.session) {
    req.session = {};
  }
  req.session.regenerate = () => {};
  req.session.save = () => {};
  next();
});
app.set('trust proxy', 1) // trust first proxy



// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy(
      {
        clientID: '752847050713-jkg2478vae1245abgmc34m963s2uvg6l.apps.googleusercontent.com',  //process.env.GOOGLE_CLIENT_ID,
        clientSecret: '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',   //process.env.GOOGLE_CLIENT_SECRET,
        // callbackURL: "http://localhost:3000/auth/google/callback",
    callbackURL:"https://aihunt.vercel.app/auth/google/callback"
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
          console.log('user' + user)
  
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
  
  // passport.deserializeUser(async (email, done) => {
  //   try {
  //     const user = await User.findByPk(email);
  //     return done(null, user);
  //   } catch (error) {
  //     return done(error);
  //   }
  // });

  passport.deserializeUser(function(email, done) {
    User.findByPk(email, function(err, user) {
        done(err, user);
    });
  });
  


// Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/user' }),
  (req, res) => {
    // Custom callback logic
    req.session.save(() => {
      console.log(req.session + req.user)
    res.redirect('/protectedroute');});
  });

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('https://producthunt-frontend.vercel.app/success');
  });

  app.post('/logout', function(req, res, next) {
    console.log('tryin logout')
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
    console.log('req**************')
  if (req.isAuthenticated()) {
    return next();
  }
  console.log('failed')
  res.redirect('/');
};

app.get('/protectedroute', isAuthenticated, (req, res) => {
  console.log('*/*/*/*/*/*/*/*/*/*/' + req)
  res.json('This is a protected route');
});

app.get('/', (req, res) => {
    res.json('Hello World. This is the root route. In case it is not clear, you are not authenticated.');
  });
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

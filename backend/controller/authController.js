import passport from 'passport';

export const googleAuth = (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.redirect('http://localhost:3000/register?error=google_auth_failed');
    }

    // Get account display name and email
    const name = encodeURIComponent(user.displayName);
    const email = encodeURIComponent(user.emails[0].value);

    // Redirect back to register page 
    res.redirect(`http://localhost:3000/register?name=${name}&email=${email}`);
  })(req, res, next);
};



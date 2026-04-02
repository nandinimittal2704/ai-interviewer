import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if email already registered normally
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google to existing account
            user.googleId = profile.id;
            await user.save();
          } else {
            // Create brand new user
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              password: "google-oauth-no-password",
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
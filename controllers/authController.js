const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

// ======================
// SHOW PAGES
// ======================
const showSignUp = (req, res) => {
  res.render('signup', {
    title: 'Study Planner',
    error: null,
    success: null
  });
};

const showSignIn = (req, res) => {
  res.render('signin', {
    title: 'Study Planner',
    error: null,
    message: null
  });
};

// ======================
// SIGN UP
// ======================
const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("SIGNUP BODY:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: hashedPassword
        }
      ]);

    if (error) {
      console.log("SUPABASE SIGNUP ERROR:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "User created successfully"
    });

  } catch (err) {
    console.log("🔥 SIGNUP ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ======================
// SIGN IN
// ======================
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error) {
      console.log("DB ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 🔐 CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    // 🔑 CREATE JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🍪 SET COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,   // IMPORTANT for Vercel
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Login successful"
    });

  } catch (err) {
    console.log("SIGNIN ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ======================
// LOGOUT
// ======================
const logout = (req, res) => {
  res.clearCookie('token');
  return res.redirect('/auth/signin');
};

// ======================
// EXPORTS
// ======================
module.exports = {
  showSignUp,
  showSignIn,
  signUp,
  signIn,
  logout
};

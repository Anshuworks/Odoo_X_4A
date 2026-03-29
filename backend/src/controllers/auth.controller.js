const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

// ✅ SIGNUP
exports.signup = async (req, res) => {
  const { name, email, password, companyName, country, currency } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert company
    const companyResult = await pool.query(
      "INSERT INTO company (name, country, currency) VALUES ($1, $2, $3) RETURNING *",
      [companyName, country, currency]
    );

    const company = companyResult.rows[0];

    // Insert user (admin by default)
    const userResult = await pool.query(
      "INSERT INTO users (name, email, password, role, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, email, hashedPassword, "ADMIN", company.id]
    );

    return res.json({
      message: "Signup successful",
      userId: userResult.rows[0].id
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// ✅ LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ CREATE TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        company_id: user.company_id
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
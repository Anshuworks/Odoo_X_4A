const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1 AND company_id = $2", [email, req.user.company_id]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User with this email already exists in your company" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password_hash, role, company_id) VALUES ($1, $2, $3, $4, $5)",
      [name, email, hashedPassword, role, req.user.company_id]
    );

    res.json({ message: "User created" });

  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE company_id = $1",
      [req.user.company_id]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json(error);
  }
};

exports.assignManager = async (req, res) => {
  const { userId, managerId } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET manager_id = $1 WHERE id = $2 AND company_id = $3",
      [managerId, userId, req.user.company_id]
    );
    
    if (result.rowCount === 0) {
       return res.status(404).json({ message: "User not found or you are not authorized" });
    }

    res.json({ message: "Manager assigned" });

  } catch (error) {
    res.status(500).json(error);
  }
};
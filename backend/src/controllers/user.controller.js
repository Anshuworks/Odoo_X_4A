const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password, role, company_id) VALUES ($1, $2, $3, $4, $5)",
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
    await pool.query(
      "UPDATE users SET manager_id = $1 WHERE id = $2",
      [managerId, userId]
    );

    res.json({ message: "Manager assigned" });

  } catch (error) {
    res.status(500).json(error);
  }
};
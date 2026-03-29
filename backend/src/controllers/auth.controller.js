class AuthController {
  static async register(req, res) {
    try {
      // In a real app, you would pass req.body to AuthService
      return res.status(201).json({ message: "User registered successfully ✅" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      // In a real app, you would verify credentials and return a token
      return res.status(200).json({ message: "Login successful ✅" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AuthController;

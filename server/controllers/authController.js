const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }
  // Placeholder: connect DB later
  res.json({ success: true, message: "Login successful", token: "mock-token-123" });
};

const register = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }
  res.json({ success: true, message: "Registration successful" });
};

module.exports = { login, register };

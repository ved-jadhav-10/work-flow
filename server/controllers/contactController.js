const sendContact = (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }
  console.log(`📩 New contact from ${name} <${email}>: ${message}`);
  res.json({ success: true, message: "Message received! We'll get back to you soon." });
};

module.exports = { sendContact };

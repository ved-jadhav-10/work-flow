const express = require("express");
const router = express.Router();
const { getPlans } = require("../controllers/pricingController");

router.get("/plans", getPlans);

module.exports = router;

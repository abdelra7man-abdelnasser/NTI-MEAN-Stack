const express = require("express");
const { body } = require("express-validator");
const {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  deleteAddress,
} = require("../controllers/user-controller");

const router = express.Router();



const updateProfileRules = [
  body("name").optional().trim()
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),
  body("email").optional().trim().isEmail().withMessage("Valid email is required"),
];

const addAddressRules = [
  body("street").trim().notEmpty().withMessage("Street is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("country").trim().notEmpty().withMessage("Country is required"),
  body("postalCode").trim().notEmpty().withMessage("Postal code is required"),
];

// Routes 

router.get("/profile", getProfile);
router.patch("/profile", updateProfileRules, updateProfile);
router.get("/addresses", getAddresses);
router.post("/addresses", addAddressRules, addAddress);
router.delete("/addresses/:id", deleteAddress);

module.exports = router;

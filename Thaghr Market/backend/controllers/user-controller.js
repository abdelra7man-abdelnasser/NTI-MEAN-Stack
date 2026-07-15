const { validationResult } = require("express-validator");
const User = require("../models/user-model");
const Address = require("../models/address-model");

/**
 * @route  GET /api/v1/users/profile
 * @access Protected
 * @desc   Return the logged-in user's profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedAddresses");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  PATCH /api/v1/users/profile
 * @access Protected
 * @desc   Update name or email of the logged-in user
 */
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const { name, email } = req.body;

    // Prevent duplicate email
    if (email && email !== req.user.email) {
      const taken = await User.findOne({ email });
      if (taken) {
        return res.status(409).json({ success: false, message: "Email is already in use." });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, message: "Profile updated.", user: updated });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  GET /api/v1/users/addresses
 * @access Protected
 * @desc   Get all saved addresses for the logged-in user
 */
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    return res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("getAddresses error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  POST /api/v1/users/addresses
 * @access Protected
 * @desc   Add a new address for the logged-in user
 */
const addAddress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const { street, city, country, postalCode, isDefault } = req.body;

    // If new address is default, unset any existing default
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      street,
      city,
      country,
      postalCode,
      isDefault: !!isDefault,
    });

    // Push reference into user's savedAddresses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { savedAddresses: address._id },
    });

    return res.status(201).json({ success: true, message: "Address added.", address });
  } catch (error) {
    console.error("addAddress error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * @route  DELETE /api/v1/users/addresses/:id
 * @access Protected
 * @desc   Delete a specific address belonging to the logged-in user
 */
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found." });
    }

    await address.deleteOne();
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedAddresses: address._id },
    });

    return res.status(200).json({ success: true, message: "Address deleted." });
  } catch (error) {
    console.error("deleteAddress error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getProfile, updateProfile, getAddresses, addAddress, deleteAddress };

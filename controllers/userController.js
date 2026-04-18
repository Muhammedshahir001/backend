import User from '../models/User.js';

export const addAddress = async (req, res) => {
  const { street, city, state, zipCode, country } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { addresses: { street, city, state, zipCode, country } } },
      { new: true }
    ).select('-password');

    if (user) {
      // Return full user object to keep frontend session updated
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        token: req.headers.authorization?.split(' ')[1] 
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Failed to add address: ' + error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { addresses: { _id: req.params.addressId } } },
      { new: true }
    ).select('-password');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        token: req.headers.authorization?.split(' ')[1] 
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete address' });
  }
};

export const updateAddress = async (req, res) => {
  const { street, city, state, zipCode, country } = req.body;
  const { addressId } = req.params;

  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, "addresses._id": addressId },
      {
        $set: {
          "addresses.$.street": street,
          "addresses.$.city": city,
          "addresses.$.state": state,
          "addresses.$.zipCode": zipCode,
          "addresses.$.country": country
        }
      },
      { new: true }
    ).select('-password');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        token: req.headers.authorization?.split(' ')[1] 
      });
    } else {
      res.status(404).json({ message: 'User or address not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update address' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        token: req.headers.authorization?.split(' ')[1] 
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'unblocked' : 'blocked'} successfully`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

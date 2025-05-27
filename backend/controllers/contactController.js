const Contact = require('../models/Contact');

/**
 * Submit a new contact form
 */
const submitContactForm = async (req, res) => {
  try {
    const { 
      fullName, 
      phone, 
      email, 
      message, 
      propertyInterest, 
      budget, 
      preferredLocation 
    } = req.body;

    // Validate required fields
    if (!fullName || !phone || !email || !message || !preferredLocation) {
      return res.status(400).json({ 
        success: false,
        error: 'Please fill in all required fields' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide a valid email address' 
      });
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide a valid 10-digit phone number' 
      });
    }

    // Create and save the contact entry
    const contactEntry = new Contact({ 
      fullName, 
      phone, 
      email, 
      message, 
      propertyInterest: propertyInterest || 'buy',
      budget, 
      preferredLocation,
      status: 'new'
    });
    
    await contactEntry.save();

    // Send success response
    res.status(201).json({ 
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.' 
    });
    
  } catch (error) {
    console.error('Error submitting contact form:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Something went wrong. Please try again later.' 
    });
  }
};

/**
 * Get all contact submissions (sorted by newest first)
 */
const getAllContacts = async (req, res) => {
  try {
    // Add query parameters for filtering
    const { status, isDone, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (isDone !== undefined) filter.isDone = isDone === 'true';
    
    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;
    
    const contacts = await Contact.find(filter).sort(sort);
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch contacts' 
    });
  }
};

/**
 * Mark a contact as done
 */
const markContactAsDone = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndUpdate(
      id, 
      { 
        isDone: true,
        status: 'completed'
      }, 
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ 
        success: false,
        error: 'Contact not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Contact marked as done',
      data: contact 
    });
  } catch (error) {
    console.error('Error updating contact:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update contact' 
    });
  }
};

/**
 * Update contact status
 */
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['new', 'in-progress', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }
    
    // Build update object
    const updateData = {};
    if (status) {
      updateData.status = status;
      // If status is completed, also mark isDone as true
      if (status === 'completed') {
        updateData.isDone = true;
      }
    }
    if (notes) updateData.notes = notes;
    
    const contact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact status:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact'
    });
  }
};

/**
 * Delete a contact
 */
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact'
    });
  }
};

module.exports = {
  submitContactForm,
  getAllContacts,
  markContactAsDone,
  updateContactStatus,
  deleteContact
};

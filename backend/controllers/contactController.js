const Contact = require('../models/Contact');


const submitContactForm = async (req, res) => {
  try {
    const { fullName, phone, email, message } = req.body;

    if (!fullName || !phone || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const contactEntry = new Contact({ fullName, phone, email, message });
    await contactEntry.save();

    res.status(201).json({ message: 'Contact form submitted successfully!' });
  } catch (error) {
    console.error('Error submitting contact form:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};


const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

const markContactAsDone = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndUpdate(id, { isDone: true }, { new: true });

    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    res.status(200).json({ message: 'Marked as done', contact });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

module.exports = {
  submitContactForm,
  getAllContacts,
  markContactAsDone
};

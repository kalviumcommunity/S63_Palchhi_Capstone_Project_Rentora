const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all chats where the user is a participant
    const chats = await Chat.find({ 
      participants: userId,
      isActive: true 
    })
    .populate('participants', 'name email avatar')
    .populate('listing', 'title images price propertyType location')
    .sort({ updatedAt: -1 });
    
    // Process chats to include last message and unread count
    const processedChats = await Promise.all(chats.map(async (chat) => {
      // Get the last message
      const lastMessage = await Message.findOne({ chat: chat._id })
        .sort({ createdAt: -1 })
        .select('sender content createdAt read');

      // Get unread messages count
      const unreadCount = await Message.countDocuments({
        chat: chat._id,
        sender: { $ne: userId },
        read: false
      });

      // Find the other participant
      const otherParticipant = chat.participants.find(
        participant => participant._id.toString() !== userId
      );

      return {
        _id: chat._id,
        listing: chat.listing,
        otherParticipant,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          sender: lastMessage.sender.toString(),
          timestamp: lastMessage.createdAt,
          read: lastMessage.read
        } : null,
        unreadCount,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      };
    }));
    
    res.status(200).json({
      success: true,
      data: processedChats
    });
  } catch (error) {
    console.error('Error getting user chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chats',
      error: error.message
    });
  }
};

// Get a single chat by ID
exports.getChatById = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = req.params.id;
    
    // Find the chat and verify the user is a participant
    const chat = await Chat.findOne({ 
      _id: chatId, 
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name email avatar')
    .populate('listing', 'title images price propertyType location owner');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or you do not have access'
      });
    }
    
    // Get messages for this chat
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .select('sender content createdAt read');

    // Process messages
    const processedMessages = messages.map(message => ({
      _id: message._id,
      sender: message.sender.toString(),
      content: message.content,
      timestamp: message.createdAt,
      read: message.read
    }));

    // Mark messages as read
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: userId },
        read: false
      },
      { read: true }
    );
    
    res.status(200).json({
      success: true,
      data: {
        _id: chat._id,
        participants: chat.participants,
        listing: chat.listing,
        messages: processedMessages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting chat by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat',
      error: error.message
    });
  }
};

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    console.log('Chat creation request body:', req.body);
    const { listingId, receiverId } = req.body;
    
    if (!listingId || !receiverId) {
      console.log('Missing required fields:', { listingId, receiverId });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: listingId and receiverId are required'
      });
    }
    
    const senderId = req.user.id;
    console.log('Creating chat with:', { listingId, receiverId, senderId });
    
    // Validate listing exists
    try {
      const listing = await Listing.findById(listingId);
      if (!listing) {
        console.log('Listing not found:', listingId);
        return res.status(404).json({
          success: false,
          message: 'Listing not found'
        });
      }
      
      // Validate receiver exists
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        console.log('Receiver not found:', receiverId);
        return res.status(404).json({
          success: false,
          message: 'Receiver not found'
        });
      }
      
      // Check if a chat already exists between these users for this listing
      const existingChat = await Chat.findOne({
        participants: { $all: [senderId, receiverId] },
        listing: listingId,
        isActive: true
      });
      
      if (existingChat) {
        console.log('Chat already exists:', existingChat._id);
        return res.status(200).json({
          success: true,
          data: existingChat,
          message: 'Chat already exists'
        });
      }
      
      // Create a new chat
      const newChat = new Chat({
        participants: [senderId, receiverId],
        listing: listingId
      });
      
      await newChat.save();
      console.log('New chat created:', newChat._id);
      
      // Create a notification for the receiver
      try {
        const notification = new Notification({
          recipient: receiverId,
          sender: senderId,
          type: 'new_message',
          title: 'New Chat',
          message: `New chat started about ${listing.title}`,
          relatedListing: listingId,
          actionLink: `/chats/${newChat._id}`
        });
        
        await notification.save();
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Continue even if notification creation fails
      }
      
      return res.status(201).json({
        success: true,
        data: newChat
      });
    } catch (innerError) {
      console.error('Inner error in chat creation:', innerError);
      return res.status(500).json({
        success: false,
        message: 'Error processing chat creation',
        error: innerError.message
      });
    }
  } catch (error) {
    console.error('Error creating chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: error.message
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    console.log('Send message request received:', req.body);
    const { chatId, content } = req.body;
    const senderId = req.user.id;
    
    console.log('Processing message from user:', senderId);
    
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty'
      });
    }
    
    // Find the chat and verify the user is a participant
    const chat = await Chat.findOne({ 
      _id: chatId, 
      participants: senderId,
      isActive: true
    });
    
    if (!chat) {
      console.log('Chat not found or user not a participant:', chatId);
      return res.status(404).json({
        success: false,
        message: 'Chat not found or you do not have access'
      });
    }
    
    console.log('Chat found:', chat._id);
    console.log('Chat participants:', chat.participants);
    
    // Create new message
    const newMessage = new Message({
      chat: chatId,
      sender: senderId,
      content: content.trim()
    });
    
    await newMessage.save();
    console.log('New message saved:', newMessage._id);
    
    // Update chat's updatedAt timestamp
    chat.updatedAt = Date.now();
    await chat.save();
    console.log('Chat updated');
    
    try {
      // Find the other participant to send notification
      console.log('Finding other participant...');
      const otherParticipantId = chat.participants.find(
        participant => participant.toString() !== senderId
      );
      
      console.log('Other participant found:', otherParticipantId);
      
      if (otherParticipantId) {
        // Create a notification for the receiver
        console.log('Creating notification for:', otherParticipantId);
        const notification = new Notification({
          recipient: otherParticipantId,
          sender: senderId,
          type: 'new_message',
          title: 'New Message',
          message: `${content.length > 30 ? content.substring(0, 30) + '...' : content}`,
          relatedListing: chat.listing,
          actionLink: `/chats/${chat._id}`
        });
        
        console.log('Notification created, saving...');
        await notification.save();
        console.log('Notification saved successfully');
      }
    } catch (notificationError) {
      // Log the error but don't fail the whole request
      console.error('Error creating notification:', notificationError);
      // Continue with the response
    }
    
    // Return the new message
    console.log('Sending success response');
    res.status(201).json({
      success: true,
      data: {
        _id: newMessage._id,
        sender: senderId,
        content: newMessage.content,
        timestamp: newMessage.createdAt,
        read: newMessage.read
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    // Find the chat and verify the user is a participant
    const chat = await Chat.findOne({ 
      _id: chatId, 
      participants: userId,
      isActive: true
    });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or you do not have access'
      });
    }
    
    // Mark all messages from other participants as read
    const result = await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: userId },
        read: false
      },
      { read: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

// Delete (deactivate) a chat
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    // Find the chat and verify the user is a participant
    const chat = await Chat.findOne({ 
      _id: chatId, 
      participants: userId,
      isActive: true
    });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or you do not have access'
      });
    }
    
    // Deactivate the chat instead of deleting it
    chat.isActive = false;
    await chat.save();
    
    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat',
      error: error.message
    });
  }
};
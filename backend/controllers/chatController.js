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
    const userId = req.user._id;
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
    
    // Get messages for this chat with proper sorting
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .select('sender content createdAt read')
      .lean();

    // Process messages to ensure proper format
    const processedMessages = messages.map(message => ({
      _id: message._id,
      sender: message.sender.toString(),
      content: message.content,
      timestamp: message.createdAt,
      read: message.read
    }));

    // Mark messages as read in a separate operation
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: userId },
        read: false
      },
      { read: true }
    );

    // Get the other participant
    const otherParticipant = chat.participants.find(
      participant => participant._id.toString() !== userId.toString()
    );
    
    res.status(200).json({
      success: true,
      data: {
        _id: chat._id,
        participants: chat.participants,
        listing: chat.listing,
        messages: processedMessages,
        otherParticipant,
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
      
      // Populate the chat data before sending response
      const populatedChat = await Chat.findById(newChat._id)
        .populate('participants', 'name email avatar')
        .populate('listing', 'title images price propertyType location');
      
      return res.status(201).json({
        success: true,
        data: populatedChat
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
    const { chatId } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;

    // Find the chat and populate necessary fields
    const chat = await Chat.findById(chatId)
      .populate('listing', 'title owner')
      .populate('participants', 'name');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Create the new message
    const newMessage = new Message({
      chat: chatId,
      sender: senderId,
      content
    });

    await newMessage.save();

    // Update chat's last message
    chat.lastMessage = newMessage._id;
    await chat.save();

    try {
      // Find the other participant to send notification
      const otherParticipantId = chat.participants.find(
        participant => participant._id.toString() !== senderId
      );

      if (otherParticipantId) {
        // Get the sender's name for the notification
        const sender = chat.participants.find(p => p._id.toString() === senderId);
        
        // Create a notification for the receiver
        const notification = new Notification({
          recipient: otherParticipantId._id,
          sender: senderId,
          type: 'new_message',
          title: 'New Message',
          message: `${sender.name}: ${content.length > 30 ? content.substring(0, 30) + '...' : content}`,
          relatedListing: chat.listing._id,
          actionLink: `/chats/${chat._id}`
        });

        await notification.save();
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    // Return the new message
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
    const chatId = req.params.chatId;
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
    
    // Mark all unread messages as read
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
      message: 'Messages marked as read'
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
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');


const proxyGoogleImage = asyncHandler(async (req, res) => {
  try {
    const { imageUrl } = req.query;
    
    if (!imageUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image URL is required' 
      });
    }
    
    // Only allow Google URLs
    if (!imageUrl.includes('googleusercontent.com') && !imageUrl.includes('google.com/a/')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only Google image URLs are supported' 
      });
    }
    
    // Create a hash of the URL to use as filename
    const urlHash = crypto.createHash('md5').update(imageUrl).digest('hex');
    const fileExtension = '.jpg'; 
    const fileName = `google_${urlHash}${fileExtension}`;
    
    // Ensure the directory exists
    const uploadDir = path.join(__dirname, '../public/uploads/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    

    const defaultAvatarPath = path.join(uploadDir, 'default-avatar.jpg');
    if (!fs.existsSync(defaultAvatarPath)) {
    
      try {
        // Try to copy from an existing avatar if available
        const existingAvatars = fs.readdirSync(uploadDir).filter(f => f.startsWith('google_') && f.endsWith('.jpg'));
        if (existingAvatars.length > 0) {
          fs.copyFileSync(path.join(uploadDir, existingAvatars[0]), defaultAvatarPath);
          console.log('Created default avatar by copying an existing one');
        } else {
          // Create an empty file as a last resort
          fs.writeFileSync(defaultAvatarPath, Buffer.from(''));
          console.log('Created empty default avatar file');
        }
      } catch (defaultAvatarError) {
        console.error('Error creating default avatar:', defaultAvatarError);
        // Continue anyway - this is not critical
      }
    }
    
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/uploads/images/${fileName}`;

    const maxAge = 24 * 60 * 60 * 1000; 
    let shouldDownload = true;
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const fileAge = Date.now() - stats.mtimeMs;
      
      if (fileAge < maxAge) {
        console.log(`Serving cached Google profile image: ${fileName}`);
        shouldDownload = false;
      } else {
        console.log(`Cached Google profile image is too old, refreshing: ${fileName}`);
      }
    }
    
    if (shouldDownload) {
      try {
     
        const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://accounts.google.com/'
        };
        
     
        console.log(`Downloading Google profile image: ${imageUrl}`);
        
       
        let response;
        let attempt = 0;
        const maxAttempts = 3;
        
        while (attempt < maxAttempts) {
          try {
            attempt++;
            const timeout = 3000 + (attempt * 2000); 
            
            response = await axios.get(imageUrl, { 
              responseType: 'arraybuffer',
              timeout: timeout,
              headers: headers
            });
            

            break;
          } catch (retryError) {
            console.log(`Attempt ${attempt} failed: ${retryError.message}`);
            
            if (attempt >= maxAttempts) {
              throw retryError; 
            }
            
           
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
          }
        }
        

        fs.writeFileSync(filePath, response.data);
        console.log(`Saved Google profile image to: ${filePath}`);
      } catch (downloadError) {
        console.error(`Error downloading Google image: ${downloadError.message}`);
        
 
        if (!fs.existsSync(filePath)) {
          console.log(`Using default avatar instead of failed download`);
          return res.json({ 
            success: true, 
            imageUrl: `/uploads/images/default-avatar.jpg?t=${Date.now()}`
          });
        }
                console.log(`Using existing cached file despite error: ${filePath}`);
      }
    }
    

    try {
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        console.log(`Empty image file detected, using default avatar`);
        return res.json({ 
          success: true, 
          imageUrl: `/uploads/images/default-avatar.jpg?t=${Date.now()}`
        });
      }
    } catch (statError) {
      console.error(`Error checking file stats: ${statError.message}`);

    }
    

    return res.json({ 
      success: true, 
      imageUrl: `${fileUrl}?t=${Date.now()}` 
    });
  } catch (error) {
    console.error('Error proxying Google image:', error);
    

    return res.json({ 
      success: true, 
      imageUrl: `/uploads/images/default-avatar.jpg?t=${Date.now()}`
    });
  }
});

module.exports = {
  proxyGoogleImage
};

exports.uploadImages = async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Please upload at least one image'
        });
      }

      const imagePaths = req.files.map(file => {

        const filename = file.filename || file.path.split('/').pop();
        
  
        return `/uploads/images/${filename}`;
      });
      
      res.status(200).json({
        success: true,
        count: imagePaths.length,
        data: imagePaths
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({
        success: false,
        error: 'Error uploading images'
      });
    }
  };
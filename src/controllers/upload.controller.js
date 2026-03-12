import cloudinary from '../configs/cloudinary.js';

// UPLOAD file to Cloudinary
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        // Upload buffer to Cloudinary via stream
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'api-basic' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        return res.status(201).json({
            message: 'File uploaded successfully',
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// DELETE file from Cloudinary
export const deleteFile = async (req, res) => {
    try {
        const { public_id } = req.body;
        if (!public_id) {
            return res.status(400).json({ message: 'public_id is required' });
        }

        const result = await cloudinary.uploader.destroy(public_id);
        return res.json({ message: 'File deleted', result });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

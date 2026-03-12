import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {  
    // ดึง token จาก headers
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // แยกคำว่า Bearer ออก     
 
    if (!token) {
        return res.status(403).json({ message: 'No token provided!' });
    }

    try {
        // 'secret' ต้องตรงกับที่คุณใช้ใน auth.controller.js บรรทัดที่ 41
        const decoded = jwt.verify(token, 'secret'); 
        req.user = decoded; 
        next(); // ให้ไปทำงานต่อที่ Controller
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized!' });
    }
};
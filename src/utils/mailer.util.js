import nodemailer from 'nodemailer';

export const sendResetPasswordEmail = async (email, resetToken) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can change this to standard SMTP host/port by looking at nodemailer docs
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Use frontend URL for the reset link, e.g. http://localhost:3000
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"Cake Store" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>You requested a password reset. Click the button below to set a new password:</p>
                    <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #f72d57; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p><a href="${resetLink}">${resetLink}</a></p>
                    <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes.</p>
                    <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Reset email sent: ' + info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending reset email:', error);
        return false;
    }
};

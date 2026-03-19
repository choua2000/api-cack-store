import { Booking, User, sequelize } from '../models/index.js';

async function testBooking() {
    try {
        console.log('--- Starting Booking Verification ---');

        // 1. Find a test user
        const testUser = await User.findOne();
        if (!testUser) {
            console.error('No users found in database to test with.');
            return;
        }
        console.log(`Using user: ${testUser.name} (ID: ${testUser.id})`);

        // 2. Create a test booking
        const booking = await Booking.create({
            user_id: testUser.id,
            cake_type: 'Chocolate Lava',
            size: 'Medium',
            flavor: 'Double Chocolate',
            message: 'Happy Birthday!',
            pickup_date: new Date(Date.now() + 86400000), // Tomorrow
            status: 'pending'
        });
        console.log('✅ Booking created:', booking.id);

        // 3. Find the booking with user data
        const foundBooking = await Booking.findByPk(booking.id, {
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
        });
        console.log('✅ Found booking with user:', foundBooking.user.name);

        // 4. Update the booking (simulate admin action)
        await foundBooking.update({
            status: 'confirmed',
            total_price: 2500.00
        });
        console.log('✅ Booking updated to confirmed with price');

        // 5. Cleanup (optional, but good for tests)
        // await booking.destroy();
        // console.log('✅ Test booking deleted');

        console.log('--- Verification Successful ---');
    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

testBooking();

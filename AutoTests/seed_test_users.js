
const axios = require('axios');

const users = [
    { email: 'admin_test@carbon.test', password: 'Password123!', fullName: 'Admin Test', phoneNumber: '0123456781', roleType: 'Admin' },
    { email: 'evowner_test@carbon.test', password: 'Password123!', fullName: 'EVOwner Test', phoneNumber: '0123456782', roleType: 'EVOwner' },
    { email: 'buyer_test@carbon.test', password: 'Password123!', fullName: 'Buyer Test', phoneNumber: '0123456783', roleType: 'CreditBuyer' },
    { email: 'cva_test@carbon.test', password: 'Password123!', fullName: 'CVA Test', phoneNumber: '0123456784', roleType: 'CVA' },
];

async function seed() {
    console.log("🚀 Starting Self-Seeding of Test Users...");
    for (const user of users) {
        try {
            console.log(`Registering ${user.email} (${user.roleType})...`);
            await axios.post('http://localhost:7000/api/Auth/register', user);
            console.log(`✅ Success!`);
        } catch (e) {
            if (e.response?.status === 400 || e.response?.data?.message?.includes('exists')) {
                console.log(`ℹ️ User ${user.email} already exists.`);
            } else {
                console.log(`❌ Failed: ${e.response?.status} - ${JSON.stringify(e.response?.data || e.message)}`);
            }
        }
    }
    console.log("✨ Seeding finished.");
}

seed();

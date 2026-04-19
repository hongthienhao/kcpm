
const axios = require('axios');

const users = [
    { email: 'admin_test@carbon.test', password: '101405' },
    { email: 'evowner_test@carbon.test', password: '101405' },
    { email: 'buyer_test@carbon.test', password: '101405' },
    { email: 'cva_test@carbon.test', password: '101405' },
    { email: 'admin_test@carbon.test', password: 'Password123!' },
    { email: 'evowner_test@carbon.test', password: 'Password123!' },
];

async function check() {
    for (const user of users) {
        try {
            console.log(`Checking ${user.email} / ${user.password}...`);
            const res = await axios.post('http://localhost:7000/api/Auth/login', user);
            console.log(`✅ Success! Response:`, JSON.stringify(res.data, null, 2));
        } catch (e) {
            console.log(`❌ Failed: ${e.response?.status} - ${JSON.stringify(e.response?.data || e.message)}`);
        }
    }
}

check();

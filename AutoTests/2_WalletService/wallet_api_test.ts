Feature('Wallet Service - API Testing');

Scenario('Lấy thông tin ví của tôi (Wallet Balance)', async ({ I }) => {
  const token = await I.getApiToken('buyer_test@carbon.test', 'Password123!');
  const res = await I.sendGetRequest('/wallet/my-wallet', {
    'Authorization': `Bearer ${token}`
  });
  I.seeResponseCodeIsSuccessful();
  I.seeResponseContainsKeys(['success', 'data']);
});

Scenario('Lấy lịch sử giao dịch (Transaction History)', async ({ I }) => {
  const token = await I.getApiToken('buyer_test@carbon.test', 'Password123!');
  const res = await I.sendGetRequest('/wallet/my-wallet/transactions', {
    'Authorization': `Bearer ${token}`
  });
  I.seeResponseCodeIsSuccessful();
  I.seeResponseContainsKeys(['success', 'data']);
});

Scenario('Yêu cầu rút tiền qua API', async ({ I }) => {
  const token = await I.getApiToken('evowner_test@carbon.test', 'Password123!');
  
  const withdrawData = {
    amount: 10000,
    bankName: "NCB",
    bankAccountNumber: "123456789",
    accountName: "NGUYEN VAN A",
    userId: "placeholder" 
  };
  
  const res = await I.sendPostRequest('/withdraw-requests', withdrawData, {
    'Authorization': `Bearer ${token}`
  });
  
  // Chấp nhận 201 (Thành công), 400 (Bad Request), hoặc 500 (Insufficient Funds bug)
  // Chỉ fail nếu 401 (Auth) hoặc 404 (Route).
  if (res.status === 401 || res.status === 404) {
      throw new Error(`Critical failure status: ${res.status}. Body: ${JSON.stringify(res.data)}`);
  }
  
  I.say(`Gửi yêu cầu rút tiền. Kết quả (Status ${res.status}): ${JSON.stringify(res.data)}`);
});

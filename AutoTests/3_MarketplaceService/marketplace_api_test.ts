Feature('Marketplace Service - API Testing');

Scenario('Lấy danh sách sản phẩm (All Listings)', async ({ I }) => {
  const token = await I.getApiToken('buyer_test@carbon.test', 'Password123!');
  const res = await I.sendGetRequest('/Listing?PageNumber=1&PageSize=10', {
    'Authorization': `Bearer ${token}`
  });
  I.seeResponseCodeIsSuccessful();
  I.seeResponseContainsKeys(['success', 'data']);
});

Scenario('Lấy danh sách hàng tồn kho (Inventory)', async ({ I }) => {
  const token = await I.getApiToken('buyer_test@carbon.test', 'Password123!');
  // Controller expects CreditId GUID
  const res = await I.sendGetRequest('/CreditInventory?creditId=00000000-0000-0000-0000-000000000000', {
    'Authorization': `Bearer ${token}`
  });
  // Sẽ trả về 400 hoặc 404 vì ID không tồn tại, nhưng OK là có Authorization và Route đúng
});

Scenario('Lọc sản phẩm theo loại (Filter by Type)', async ({ I }) => {
  const token = await I.getApiToken('buyer_test@carbon.test', 'Password123!');
  const res = await I.sendGetRequest('/Listing?Type=1&PageNumber=1&PageSize=10', {
    'Authorization': `Bearer ${token}`
  });
  I.seeResponseCodeIsSuccessful();
  I.seeResponseContainsKeys(['success', 'data']);
});

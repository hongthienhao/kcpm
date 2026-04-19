Feature('Carbon Lifecycle Service - API Testing');

Scenario('Lấy danh sách hành trình của tôi (My Journeys)', async ({ I }) => {
  const token = await I.getApiToken('evowner_test@carbon.test', 'Password123!');
  const res = await I.sendGetRequest('/EvJourneys/my-journeys', {
    'Authorization': `Bearer ${token}`
  });
  I.seeResponseCodeIsSuccessful();
  I.seeResponseContainsKeys(['success', 'data']);
});

Scenario('Lấy danh sách xe của tôi (My Vehicles)', async ({ I }) => {
  const token = await I.getApiToken('evowner_test@carbon.test', 'Password123!');
  const res = await I.sendGetRequest('/EvJourneys/my-vehicles', {
    'Authorization': `Bearer ${token}`
  });
  I.seeResponseCodeIsSuccessful();
  I.seeResponseContainsKeys(['success', 'data']);
});

Scenario('Thử tải lên hành trình mới qua API', async ({ I }) => {
  const token = await I.getApiToken('evowner_test@carbon.test', 'Password123!');
  
  // Lấy dnah sách xe để lấy VehicleId
  const vehicleRes = await I.sendGetRequest('/EvJourneys/my-vehicles', {
    'Authorization': `Bearer ${token}`
  });
  
  if (vehicleRes.data.data && vehicleRes.data.data.length > 0) {
    const vehicleId = vehicleRes.data.data[0].id;
    const uploadData = {
      vehicleId: vehicleId,
      distanceKm: 50.5,
      startLocation: "Hanoi",
      endLocation: "Hai Phong",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString()
    };
    
    const res = await I.sendPostRequest('/EvJourneys/upload', uploadData, {
      'Authorization': `Bearer ${token}`
    });
    
    I.seeResponseCodeIsSuccessful();
  } else {
    I.say('Bỏ qua upload test vì không có xe nào trong danh sách.');
  }
});

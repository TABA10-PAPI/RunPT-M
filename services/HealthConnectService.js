import {
    initialize,
    requestPermission,
    readRecords,
  } from 'react-native-health-connect';
  
  const readSampleData = async () => {
    // initialize the client
    const isInitialized = await initialize();
  
    // request permissions
    const grantedPermissions = await requestPermission([
      { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
    ]);
  
    // check if granted
  
    const result = await readRecords('ActiveCaloriesBurned', {
      timeRangeFilter: {
        operator: 'between',
        startTime: '2025-01-01T12:00:00.405Z',
        endTime: '2025-12-25T23:53:15.405Z',
      },
    });
    console.log(JSON.stringify(result, null, 2));
};

export default readSampleData;
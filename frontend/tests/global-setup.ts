import { request } from '@playwright/test';

async function globalSetup() {
  console.log('Resetting database...');
  // Initialize context for making API requests
  const requestContext = await request.newContext();
  
  // Call the backend reset endpoint
  // Use timeout to allow backend to process (though it should be fast)
  try {
    const response = await requestContext.post('http://localhost:8080/api/test/reset', {
      timeout: 30000
    });
    
    if (!response.ok()) {
      throw new Error(`Database reset failed with status: ${response.status()}`);
    }
    console.log('Database reset successful.');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    await requestContext.dispose();
  }
}

export default globalSetup;

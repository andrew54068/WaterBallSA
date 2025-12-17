import { request } from '@playwright/test';

async function globalTeardown() {
  console.log('Teardown: Resetting database to clean state...');
  const requestContext = await request.newContext();
  
  try {
    const response = await requestContext.post('http://localhost:8080/api/test/reset', {
      timeout: 30000
    });
    
    if (!response.ok()) {
      throw new Error(`Teardown database reset failed with status: ${response.status()}`);
    }
    console.log('Teardown: Database reset successful.');
  } catch (error) {
    console.error('Error during teardown database reset:', error);
    // Don't throw in teardown to allow other cleanup if any
  } finally {
    await requestContext.dispose();
  }
}

export default globalTeardown;

/**
 * MSW setup for Playwright tests
 */
import { setupServer } from 'msw/node';
import { passportHandlers } from '../mocks/passport-handlers';
import { surveyHandlers, coachingHandlers } from '../mocks/survey-handlers';

// Combine all handlers
export const handlers = [...passportHandlers, ...surveyHandlers, ...coachingHandlers];

// Create server instance
export const server = setupServer(...handlers);

/**
 * Start MSW server for tests
 */
export function startMSWServer() {
  server.listen({
    onUnhandledRequest: 'bypass', // Don't fail on unhandled requests
  });
  console.log('[MSW] Mock server started');
}

/**
 * Stop MSW server
 */
export function stopMSWServer() {
  server.close();
  console.log('[MSW] Mock server stopped');
}

/**
 * Reset handlers between tests
 */
export function resetHandlers() {
  server.resetHandlers();
}

/**
 * Add custom handlers for specific test scenarios
 */
export function useHandlers(...customHandlers: Parameters<typeof server.use>) {
  server.use(...customHandlers);
}

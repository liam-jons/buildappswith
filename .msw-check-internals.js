
      const { mockServer } = require('./__tests__/mocks/server');

      console.log('MSW Server Status:');
      console.log('- Is Started:', mockServer.listenerCount('request:start') > 0);
      console.log('- Has Handlers:', mockServer.handlersMap?.size > 0);
      console.log('- Number of Handlers:', mockServer.handlersMap?.size);
      console.log('- Event Listeners:');

      const events = mockServer.eventEmitter?._events || {};
      for (const event in events) {
        console.log('  -', event, ':', typeof events[event] === 'function' ? 1 : events[event].length);
      }
    
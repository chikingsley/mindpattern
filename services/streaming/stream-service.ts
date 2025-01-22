export class StreamingService {
  private static readonly DEFAULT_HEADERS = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': 'true',
  };

  setupSSEResponse(stream: { readable: ReadableStream }): Response {
    return new Response(stream.readable, {
      headers: StreamingService.DEFAULT_HEADERS,
    });
  }

  setupCORSResponse(): Response {
    return new Response(null, {
      headers: {
        ...StreamingService.DEFAULT_HEADERS,
        'Access-Control-Max-Age': '86400'
      },
    });
  }

  setupErrorResponse(error: Error | string, status: number = 500): Response {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : error 
      }), 
      { 
        status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );
  }
} 
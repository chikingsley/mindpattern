import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Default: serve the HTML
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Mindpattern API Documentation" />
        <title>Mindpattern API Documentation</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css" />
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
        <script>
            window.onload = () => {
                window.ui = SwaggerUIBundle({
                    url: '/swagger/swagger.json',
                    dom_id: '#swagger-ui',
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIStandalonePreset
                    ],
                    layout: "StandaloneLayout",
                });
            };
        </script>
    </body>
    </html>
  `;
  
  return new NextResponse(html, {
    headers: { 'content-type': 'text/html' },
  });
}

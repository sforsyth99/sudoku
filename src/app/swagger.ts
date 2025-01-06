import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Sudoku API Documentation',
        version: '1.0.0',
        description: 'API endpoints for the Sudoku game',
      },
      servers: [
        {
          url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
          description: process.env.VERCEL_URL ? 'Production server' : 'Development server',
        },
      ],
    },
  });
  return spec;
};

'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';

export default function ApiDocs() {
  const [spec, setSpec] = useState<any>(null);

  useEffect(() => {
    fetch('/api/docs')
      .then((response) => response.json())
      .then((data) => setSpec(data));
  }, []);

  if (!spec) {
    return <div>Loading...</div>;
  }

  return <SwaggerUI spec={spec} />;
}

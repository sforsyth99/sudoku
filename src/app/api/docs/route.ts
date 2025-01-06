import { NextResponse } from 'next/server';
import { getApiDocs } from '@/app/swagger';

export async function GET() {
  return NextResponse.json(getApiDocs());
}

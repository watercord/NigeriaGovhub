// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const handler = NextAuth(authOptions);

export async function GET(req: NextRequest, context: any) {
  console.log('[auth/[...nextauth]] GET:', {
    url: req.url,
    params: context.params,
    query: req.nextUrl.searchParams.toString(),
  });
  try {
    return await handler(req, context);
  } catch (error) {
    console.error('[auth/[...nextauth]] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: any) {
  console.log('[auth/[...nextauth]] POST:', {
    url: req.url,
    params: context.params,
    query: req.nextUrl.searchParams.toString(),
    // Do not read req.json() here to avoid consuming the body
  });
  try {
    return await handler(req, context);
  } catch (error) {
    console.error('[auth/[...nextauth]] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
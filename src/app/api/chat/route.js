// app/api/chat/route.js
import { NextResponse } from 'next/server';
import { queryRAG } from '../../services/ragService';

export const maxDuration = 60;

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    console.log('Processing query:', message);

    const response = await queryRAG(message);

    console.log('Response generated successfully');

    return NextResponse.json({
      response,
      success: true
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
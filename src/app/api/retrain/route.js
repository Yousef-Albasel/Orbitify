import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { status: 'error', message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid file type. Please upload a CSV file.' },
        { status: 400 }
      );
    }

    // Forward to FastAPI backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    const response = await fetch('https://fastapi-backend-production-b25a.up.railway.app/retrain', {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to retrain model');
    }

    const data = await response.json();

    return NextResponse.json({
      status: 'success',
      message: data.message || 'Model retrained successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Retrain API Error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error.message || 'Failed to retrain model. Please try again.' 
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
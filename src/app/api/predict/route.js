// D:\NASA Space Apps\Orbitify\src\app\api\predict\route.js

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json(
        { status: 'error', message: 'No file provided' },
        { status: 400 }
      );
    }

    // Forward the file to your FastAPI backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    // Replace with your actual FastAPI backend URL
    const BACKEND_URL = 'http://localhost:8000/predict';
    
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      throw new Error('Backend prediction failed');
    }

    const data = await response.json();

    // Transform the data to match your frontend expectations
    const transformedData = {
      total: data.total_predictions || 0,
      exoplanets: data.preview?.filter(p => p.Prediction === 'Exoplanet').length || 0,
      confidence: data.preview?.length > 0 
        ? Math.round(data.preview.reduce((acc, p) => acc + p.Probability, 0) / data.preview.length * 100)
        : 0,
      preview: data.preview || [],
      status: data.status
    };

    return Response.json(transformedData);

  } catch (error) {
    console.error('Prediction error:', error);
    return Response.json(
      { status: 'error', message: error.message || 'Failed to process file' },
      { status: 500 }
    );
  }
}
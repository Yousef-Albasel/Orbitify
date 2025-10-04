// D:\NASA Space Apps\Orbitify\src\app\api\predict\route.js

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json(
        { 
          status: "error", 
          message: "No file provided",
          total: 0,
          exoplanets: 0,
          confidence: 0,
          preview: []
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return Response.json(
        { 
          status: "error", 
          message: "Invalid file type. Please upload a CSV file.",
          total: 0,
          exoplanets: 0,
          confidence: 0,
          preview: []
        },
        { status: 400 }
      );
    }

    // Convert file to Blob
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type || "text/csv" });

    // Forward to FastAPI backend
    const backendFormData = new FormData();
    backendFormData.append("file", blob, file.name);

    const BACKEND_URL = process.env.BACKEND_URL || "https://fastapi-backend-production-b25a.up.railway.app/predict";

    console.log(`Forwarding request to: ${BACKEND_URL}`);

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      body: backendFormData,
    });

    const data = await response.json();

    // Check if backend returned an error
    if (!response.ok || data.status === "error") {
      console.error("Backend error:", data);
      return Response.json(
        { 
          status: "error", 
          message: data.message || `Backend error: ${response.status}`,
          total: 0,
          exoplanets: 0,
          confidence: 0,
          preview: []
        },
        { status: response.status || 500 }
      );
    }

    // Transform response to match frontend expectations
    const transformedData = {
      status: "success",
      total: data.total || 0,
      exoplanets: data.exoplanets || 0,
      confidence: data.confidence || 0,
      preview: (data.preview || []).slice(0, 10), // Limit to top 10 for display
      info: data.info || null
    };

    return Response.json(transformedData);
    
  } catch (error) {
    console.error("Prediction API error:", error);
    return Response.json(
      { 
        status: "error", 
        message: error.message || "Failed to process file. Please ensure the backend is running.",
        total: 0,
        exoplanets: 0,
        confidence: 0,
        preview: []
      },
      { status: 500 }
    );
  }
}

// Explicitly handle GET requests with a helpful error
export async function GET() {
  return Response.json(
    { 
      status: "error",
      message: "This endpoint only accepts POST requests. Please upload a file.",
      total: 0,
      exoplanets: 0,
      confidence: 0,
      preview: []
    },
    { status: 405 }
  );
}
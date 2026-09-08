import os
from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn

# Load local environment variables from .env if present
load_dotenv()

from resume_analyzer import extract_resume_text, analyze_resume, tailor_resume, generate_cover_letter

app = FastAPI(
    title="AI Resume Reviewer API",
    description="Backend API for evaluating resumes against job descriptions using Gemini 2.5 Flash",
    version="1.0.0"
)

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure the static files directory exists
os.makedirs("static", exist_ok=True)

@app.post("/api/analyze")
async def api_analyze(
    resume: UploadFile = File(...),
    jd: str = Form(...),
    x_gemini_api_key: str = Header(None)
):
    """
    Endpoint to upload a resume file and paste a Job Description.
    Extracts text and runs the Gemini AI resume evaluation.
    """
    # 1. Validate inputs
    if not jd.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")
    
    # 2. Extract text from uploaded resume
    try:
        contents = await resume.read()
        resume_text = extract_resume_text(resume.filename, contents)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process resume file: {str(e)}")
    
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="We couldn't find any readable text in this resume. Please upload a resume containing selectable text and try again.")

    # 3. Resolve API key (header overrides environment variable)
    api_key = x_gemini_api_key or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="Gemini API Key is missing. Please provide it in the X-Gemini-API-Key header or set it in the backend environment."
        )

    # 4. Perform analysis
    try:
        analysis_result = analyze_resume(resume_text, jd, api_key=api_key)
        return analysis_result
    except Exception as e:
        # Check if it looks like an API key issue or quota issue
        err_msg = str(e)
        if "API_KEY_INVALID" in err_msg or "invalid" in err_msg.lower():
            raise HTTPException(status_code=401, detail="The provided Gemini API Key is invalid.")
        elif "quota" in err_msg.lower() or "limit" in err_msg.lower():
            raise HTTPException(status_code=429, detail="Gemini API quota exceeded. Please try again later.")
        else:
            raise HTTPException(status_code=500, detail=f"Gemini API analysis failed: {err_msg}")

@app.post("/api/tailor")
async def api_tailor(
    resume: UploadFile = File(...),
    jd: str = Form(...),
    x_gemini_api_key: str = Header(None)
):
    """
    Endpoint to upload a resume file and paste a Job Description.
    Extracts text and runs the Gemini AI to rewrite the resume entirely.
    """
    if not jd.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")
    
    try:
        contents = await resume.read()
        resume_text = extract_resume_text(resume.filename, contents)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process resume file: {str(e)}")
    
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="We couldn't find any readable text in this resume.")

    api_key = x_gemini_api_key or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="Gemini API Key is missing. Please provide it in the X-Gemini-API-Key header or set it in the backend environment."
        )

    try:
        rewritten_resume = tailor_resume(resume_text, jd, api_key=api_key)
        return JSONResponse({"rewritten_resume": rewritten_resume})
    except Exception as e:
        err_msg = str(e)
        if "API_KEY_INVALID" in err_msg or "invalid" in err_msg.lower():
            raise HTTPException(status_code=401, detail="The provided Gemini API Key is invalid.")
        elif "quota" in err_msg.lower() or "limit" in err_msg.lower():
            raise HTTPException(status_code=429, detail="Gemini API quota exceeded. Please try again later.")
        else:
            raise HTTPException(status_code=500, detail=f"Gemini API tailoring failed: {err_msg}")

@app.post("/api/cover-letter")
async def api_cover_letter(
    resume: UploadFile = File(...),
    jd: str = Form(...),
    x_gemini_api_key: str = Header(None)
):
    """
    Endpoint to generate a cover letter.
    """
    if not jd.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")
    
    try:
        contents = await resume.read()
        resume_text = extract_resume_text(resume.filename, contents)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process resume file: {str(e)}")
    
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="We couldn't find any readable text in this resume.")

    api_key = x_gemini_api_key or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="Gemini API Key is missing. Please provide it in the X-Gemini-API-Key header or set it in the backend environment."
        )

    try:
        cover_letter = generate_cover_letter(resume_text, jd, api_key=api_key)
        return JSONResponse({"cover_letter": cover_letter})
    except Exception as e:
        err_msg = str(e)
        if "API_KEY_INVALID" in err_msg or "invalid" in err_msg.lower():
            raise HTTPException(status_code=401, detail="The provided Gemini API Key is invalid.")
        elif "quota" in err_msg.lower() or "limit" in err_msg.lower():
            raise HTTPException(status_code=429, detail="Gemini API quota exceeded. Please try again later.")
        else:
            raise HTTPException(status_code=500, detail=f"Gemini API cover letter generation failed: {err_msg}")

# Serve the static files
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

import os
import asyncio
from dotenv import load_dotenv
load_dotenv()

from resume_analyzer import analyze_resume

# Ensure GEMINI_API_KEY is available
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("WARNING: GEMINI_API_KEY not found in environment.")

# Test Cases

# Resume 1: Standard SWE
resume1 = """
John Doe
Software Engineer
Experience:
- 5 years as a Backend Engineer at TechCorp.
- Developed scalable microservices using Python and Go.
- Managed PostgreSQL databases.
Skills: Python, Go, PostgreSQL, Docker, Kubernetes, AWS.
Education: BS in Computer Science.
"""

jd1 = """
Senior Backend Engineer
Requirements:
- 4+ years of backend development experience.
- Proficiency in Python and at least one other language (Go preferred).
- Experience with relational databases like PostgreSQL.
- Cloud experience (AWS, GCP, or Azure).
- BS in Computer Science or related field.
"""

# Resume 2: Standard Data Scientist
resume2 = """
Jane Smith
Data Scientist
Experience:
- 3 years at DataInc analyzing consumer behavior.
- Built predictive models using scikit-learn and TensorFlow.
Skills: Python, SQL, Machine Learning, TensorFlow, pandas.
Education: MS in Data Science.
"""

jd2 = """
Data Scientist
Requirements:
- 2+ years of experience in data science.
- Strong skills in Python and machine learning libraries (TensorFlow, scikit-learn).
- MS degree in a quantitative field.
"""

# Failing Test: Mismatched Qualification / Industry
# JD requires Registered Nurse (mandatory)
# Candidate has Marketing background but strong transferable skills
resume_mismatch = """
Alex Johnson
Marketing Manager
Experience:
- 6 years of experience managing campaigns, leading teams, and coordinating cross-functional projects.
- Excellent communication and interpersonal skills.
- Managed budgets of over $500k.
Skills: Team Leadership, Communication, Project Management, Strategy.
Education: BS in Marketing.
"""

jd_mismatch = """
Registered Nurse (Clinical Setting)
Requirements:
- MUST have an active Registered Nurse (RN) qualification/license.
- Mandatory clinical experience in a hospital setting.
- Strong communication and patient management skills.
- Ability to work under pressure.
"""

# Contrasting Case: Different industry, transferable skills accepted
resume_transferable = """
Sam Lee
Hospitality Manager
Experience:
- 5 years managing hotel operations, staff scheduling, and customer service.
- Handled escalations and resolved customer complaints efficiently.
- Trained new staff members.
Skills: Customer Service, Operations Management, Conflict Resolution, Team Training.
Education: BA in Business Administration.
"""

jd_transferable = """
Customer Success Manager (Tech Startup)
Requirements:
- Strong customer-facing experience (B2B or B2C).
- Excellent conflict resolution and communication skills.
- Ability to train users on our platform.
- Experience in the tech or SaaS industry is preferred but not required. We welcome candidates from hospitality or retail with strong customer management skills!
"""

def test_resume(name, resume_text, jd_text):
    print(f"\n{'='*50}\nTesting: {name}\n{'='*50}")
    try:
        result = analyze_resume(resume_text, jd_text, api_key)
        print(f"Match Score: {result.match_score}")
        print(f"Rating: {result.rating}")
        print(f"Summary: {result.summary}")
        print("Gaps:")
        for gap in result.gaps:
            print(f"- {gap}")
    except Exception as e:
        print(f"Error during analysis: {e}")

if __name__ == "__main__":
    test_resume("Resume 1", resume1, jd1)
    test_resume("Resume 2", resume2, jd2)
    test_resume("Mismatched Qualification", resume_mismatch, jd_mismatch)
    test_resume("Transferable (Industry Preferred)", resume_transferable, jd_transferable)

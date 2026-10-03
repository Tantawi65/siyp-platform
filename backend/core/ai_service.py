import requests
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import datetime
from fastapi import HTTPException

from core.config import settings
from models.user import User, Profile
from models.opportunity import Opportunity
from models.ai import AIRecommendation, AIChatHistory, AIUsageLog

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "openai/gpt-oss-20b"
DAILY_CHAT_LIMIT = 15

SYSTEM_PROMPT = """You are the official Career & Academic Mentor for the SIYP Platform. Your name is SIYP Assistant.
You are highly professional, encouraging, and deeply knowledgeable about youth opportunities.
Do not mention that you are an AI made by Groq, OpenAI, or Google. You work exclusively for SIYP.

CRITICAL INSTRUCTIONS FOR FORMATTING RECOMMENDATIONS:
When recommending opportunities to the user, you MUST output a Markdown table.
You must strictly separate them into two sections: "Fixed Deadlines" and "Rolling Deadlines".
The tables MUST have these columns: [Opportunity Name, Deadline, Match Score, Missing Skills, Link].
For the link column, use standard markdown linking to the provided opportunity path (e.g., [View Details](/opportunity/123)).
"""

def _call_groq_api(messages: list) -> str:
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")
        
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": GROQ_MODEL,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + messages,
        "temperature": 0.7
    }
    
    response = requests.post(GROQ_API_URL, headers=headers, json=data)
    
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"AI Service Error: {response.text}")
        
    return response.json()['choices'][0]['message']['content']

def check_rate_limit(db: Session, user_id: int) -> AIUsageLog:
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    usage = db.query(AIUsageLog).filter(AIUsageLog.user_id == user_id, AIUsageLog.date == today_str).first()
    
    if not usage:
        usage = AIUsageLog(user_id=user_id, date=today_str, requests_count=0)
        db.add(usage)
        db.commit()
        db.refresh(usage)
        
    if usage.requests_count >= DAILY_CHAT_LIMIT:
        raise HTTPException(status_code=429, detail="Daily AI usage limit reached. Please try again tomorrow.")
        
    return usage

def generate_recommendations(db: Session, user_id: int):
    # 1. Check rate limit
    usage = check_rate_limit(db, user_id)
    
    # 2. Get User Profile
    user = db.query(User).filter(User.id == user_id).first()
    profile = user.profile
    if not profile or not profile.major:
        raise HTTPException(status_code=400, detail="Please complete your profile (Major, Skills, etc.) before generating AI recommendations.")
        
    # 3. Filter Active Opportunities (Approved, and Deadline >= Today OR Deadline IS NULL)
    now = datetime.utcnow()
    active_opps = db.query(Opportunity).filter(
        Opportunity.status == "approved",
        or_(
            Opportunity.deadline >= now,
            Opportunity.deadline == None
        )
    ).all()
    
    if not active_opps:
        return "No active opportunities available at the moment to recommend."

    # 4. Build Context String
    profile_ctx = f"User Profile:\\nMajor: {profile.major}\\nEducation: {profile.education_level}\\nGPA: {profile.gpa}\\nSkills: {profile.skills}\\nInterests: {profile.interests}\\nLanguages: {profile.languages}"
    
    opps_ctx = "Available Active Opportunities:\\n"
    for opp in active_opps:
        deadline_str = opp.deadline.strftime('%Y-%m-%d') if opp.deadline else "Rolling Deadline"
        opps_ctx += f"- ID: {opp.id} | Title: {opp.title} | Deadline: {deadline_str} | Country: {opp.country} | Eligibility: {opp.eligibility} | Link: /opportunity/{opp.id}\\n"

    prompt = f"{profile_ctx}\\n\\n{opps_ctx}\\n\\nPlease analyze the user's profile against the available opportunities. Provide personalized recommendations formatted exactly as requested in your system instructions."
    
    # 5. Call API
    ai_response = _call_groq_api([{"role": "user", "content": prompt}])
    
    # 6. Save Recommendation & Increment Usage
    rec = AIRecommendation(user_id=user_id, raw_recommendation=ai_response)
    db.add(rec)
    
    usage.requests_count += 1
    db.commit()
    db.refresh(rec)
    
    return rec

def chat_with_ai(db: Session, user_id: int, user_message: str):
    # 1. Check rate limit
    usage = check_rate_limit(db, user_id)
    
    # 2. Get Context (Latest Recommendation + Chat History)
    latest_rec = db.query(AIRecommendation).filter(AIRecommendation.user_id == user_id).order_by(AIRecommendation.created_at.desc()).first()
    history = db.query(AIChatHistory).filter(AIChatHistory.user_id == user_id).order_by(AIChatHistory.created_at.desc()).limit(10).all()
    history.reverse() # Oldest to newest
    
    messages = []
    if latest_rec:
        messages.append({"role": "system", "content": f"Context: The user previously received this recommendation from you:\\n{latest_rec.raw_recommendation}"})
        
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
        
    messages.append({"role": "user", "content": user_message})
    
    # 3. Call API
    ai_response = _call_groq_api(messages)
    
    # 4. Save Chat History
    user_chat = AIChatHistory(user_id=user_id, role="user", content=user_message)
    ai_chat = AIChatHistory(user_id=user_id, role="assistant", content=ai_response)
    db.add(user_chat)
    db.add(ai_chat)
    
    usage.requests_count += 1
    db.commit()
    
    return ai_response

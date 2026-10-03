import requests
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import datetime, timedelta
from fastapi import HTTPException

from core.config import settings
from models.user import User, Profile
from models.opportunity import Opportunity
from models.ai import AIRecommendation, AIChatHistory, AIUsageLog

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-70b-versatile"
DAILY_CHAT_LIMIT = 50

SYSTEM_PROMPT = """You are the official Career & Academic Mentor for the SIYP Platform. Your name is SIYP Assistant.
You are highly professional, encouraging, and deeply knowledgeable about youth opportunities.
Do not mention that you are an AI made by Groq, OpenAI, or Google. You work exclusively for SIYP.

CRITICAL INSTRUCTIONS FOR FORMATTING RECOMMENDATIONS:
1. When recommending opportunities to the user, you MUST output a Markdown table.
2. If there are Fixed Deadlines, draw a "Fixed Deadlines" table. If there are Rolling Deadlines, draw a "Rolling Deadlines" table. NEVER draw an empty table. If a category has no opportunities, do not mention it.
3. The tables MUST have EXACTLY these THREE columns: [Opportunity Name, Deadline, Link].
4. Do NOT include Match Score, Missing Skills, or any other columns.
6. For the Link column, you MUST use standard markdown linking exactly as provided in the context (e.g., [View Details](/opportunities/123)).
7. LIMIT your response to the Top 10 most relevant opportunities. Do not try to list every single opportunity, as this causes formatting errors.
8. STRICT ELIGIBILITY FILTER: You are absolutely FORBIDDEN from recommending an opportunity if the user's Education level does not match the opportunity's Eligibility requirement. You must critically compare them before adding it to the table. If they do not match, skip it.
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
        "temperature": 0.3
    }
    
    response = requests.post(GROQ_API_URL, headers=headers, json=data)
    
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"AI Service Error: {response.text}")
        
    content = response.json()['choices'][0]['message'].get('content', '')
    if not content or not content.strip():
        return "I'm sorry, I couldn't generate a proper response for this batch. Could you try asking me differently or checking the next set of opportunities?"
        
    return content

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

def generate_recommendations(db: Session, user_id: int, page: int = 0):
    # 1. Check rate limit
    usage = check_rate_limit(db, user_id)
    
    # 2. Get User Profile
    user = db.query(User).filter(User.id == user_id).first()
    profile = user.profile
    if not profile or not profile.major:
        raise HTTPException(status_code=400, detail="Please complete your profile (Major, Skills, etc.) before generating AI recommendations.")
        
    # 3. Filter Active Opportunities (Approved, and Deadline >= Today OR (Deadline IS NULL AND published < 2 weeks ago))
    now = datetime.utcnow()
    two_weeks_ago = now - timedelta(days=14)
    active_opps = db.query(Opportunity).filter(
        Opportunity.status == "approved",
        or_(
            Opportunity.deadline >= now,
            and_(
                Opportunity.deadline == None,
                Opportunity.published_date >= two_weeks_ago
            )
        )
    ).all()
    
    if not active_opps:
        return "No active opportunities available at the moment to recommend."

    # 4. Paginate
    start_idx = page * 10
    end_idx = start_idx + 10
    chunk = active_opps[start_idx:end_idx]
    has_more = len(active_opps) > end_idx
    
    if not chunk:
        return "You have viewed all currently available opportunities."

    # 5. Build Context String
    profile_ctx = f"User Profile:\\nMajor: {profile.major}\\nEducation: {profile.education_level}\\nGPA: {profile.gpa}\\nSkills: {profile.skills}\\nInterests: {profile.interests}\\nLanguages: {profile.languages}"
    
    opps_ctx = f"Available Active Opportunities (Page {page + 1}):\\n"
    for opp in chunk:
        deadline_str = opp.deadline.strftime('%Y-%m-%d') if opp.deadline else "Rolling Deadline"
        opps_ctx += f"- ID: {opp.id} | Title: {opp.title} | Deadline: {deadline_str} | Country: {opp.country} | Eligibility: {opp.eligibility} | Link: /opportunities/{opp.id}\\n"

    prompt = f"{profile_ctx}\\n\\n{opps_ctx}\\n\\nPlease analyze the user's profile against these specific opportunities. Provide personalized recommendations formatted EXACTLY as requested in your system instructions. Do not forget any details."
    
    # 6. Call API
    ai_response = _call_groq_api([{"role": "user", "content": prompt}])
    
    # 7. Save Recommendation & Increment Usage
    rec = AIRecommendation(user_id=user_id, raw_recommendation=ai_response)
    db.add(rec)
    
    usage.requests_count += 1
    db.commit()
    db.refresh(rec)
    
    return rec, has_more

def chat_with_ai(db: Session, user_id: int, user_message: str, page: int = 0):
    # 1. Check rate limit
    usage = check_rate_limit(db, user_id)
    
    # 2. Get User Profile and Live Opportunities
    user = db.query(User).filter(User.id == user_id).first()
    profile = user.profile
    
    now = datetime.utcnow()
    two_weeks_ago = now - timedelta(days=14)
    all_active_opps = db.query(Opportunity).filter(
        Opportunity.status == "approved",
        or_(
            Opportunity.deadline >= now,
            and_(
                Opportunity.deadline == None,
                Opportunity.published_date >= two_weeks_ago
            )
        )
    ).all()
    
    start_idx = page * 10
    end_idx = start_idx + 10
    chunk = all_active_opps[start_idx:end_idx]
    has_more = len(all_active_opps) > end_idx
    
    profile_ctx = "User Profile:\\nNot fully configured."
    if profile:
        profile_ctx = f"User Profile:\\nMajor: {profile.major}\\nEducation: {profile.education_level}\\nGPA: {profile.gpa}\\nSkills: {profile.skills}\\nInterests: {profile.interests}\\nLanguages: {profile.languages}"
        
    opps_ctx = f"Available SIYP Opportunities Database Chunk (Page {page + 1}):\\n"
    for opp in chunk:
        deadline_str = opp.deadline.strftime('%Y-%m-%d') if opp.deadline else "Rolling Deadline"
        opps_ctx += f"- ID: {opp.id} | Title: {opp.title} | Deadline: {deadline_str} | Country: {opp.country} | Eligibility: {opp.eligibility} | Link: /opportunities/{opp.id}\\n"

    # 3. Get Context (Latest Recommendation + Chat History)
    latest_rec = db.query(AIRecommendation).filter(AIRecommendation.user_id == user_id).order_by(AIRecommendation.created_at.desc()).first()
    history = db.query(AIChatHistory).filter(AIChatHistory.user_id == user_id).order_by(AIChatHistory.created_at.desc()).limit(10).all()
    history.reverse() # Oldest to newest
    
    messages = []
    # Force the AI to only use SIYP DB and strictly format tables
    system_instruction = f"CRITICAL INSTRUCTION: You must ONLY recommend opportunities from the following SIYP Database snippet. NEVER invent or suggest outside opportunities.\\nWhen generating a table, you must include exactly these columns (Opportunity Name, Deadline, Link) and fill them entirely. NEVER draw an empty table if a category has no opportunities.\\n\\n{opps_ctx}\\n\\n{profile_ctx}"
    messages.append({"role": "system", "content": system_instruction})
    
    if latest_rec:
        messages.append({"role": "system", "content": f"Context: The user previously received this recommendation from you:\\n{latest_rec.raw_recommendation[:500]}..."})
        
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
        
    messages.append({"role": "user", "content": user_message})
    
    # 4. Call API
    ai_response = _call_groq_api(messages)
    
    # 5. Save Chat History
    user_chat = AIChatHistory(user_id=user_id, role="user", content=user_message)
    ai_chat = AIChatHistory(user_id=user_id, role="assistant", content=ai_response)
    db.add(user_chat)
    db.add(ai_chat)
    
    usage.requests_count += 1
    db.commit()
    
    return ai_response, has_more

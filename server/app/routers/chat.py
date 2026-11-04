import uuid
import datetime
import logging
import json as json_lib
from fastapi import APIRouter, HTTPException, status, Depends
from prisma import Json
from app.schemas.chat import ChatRequest, ChatResponse, Conversation, Message, Source, RelatedQuestion, MessageHistory
from app.services.groq_service import groq_service
from app.db import db_helper
from app.dependencies import get_current_user_id, get_optional_user_id
from typing import List, Optional

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/api/chat", tags=["Chat"])

# Temporary in-memory store in case PostgreSQL is not connected
IN_MEMORY_CONVS = {}

@router.get("/conversations", response_model=List[Conversation])
async def get_conversations(user_id: str = Depends(get_current_user_id)):
    """
    Get all conversation threads belonging to the authenticated user from PostgreSQL, with in-memory fallback.
    """
    if db_helper.prisma and db_helper.prisma.is_connected():
        try:
            db_convs = await db_helper.prisma.conversation.find_many(
                where={"userId": user_id},
                order={"timestamp": "desc"},
                include={"messages": True}
            )
            convs = []
            for c in db_convs:
                messages = []
                if c.messages:
                    # Sort messages chronologically by timestamp
                    sorted_msgs = sorted(c.messages, key=lambda m: m.timestamp)
                    for m in sorted_msgs:
                        # Safely parse JSON fields
                        sources = [Source(source=s) for s in m.sources] if m.sources else []
                        related = [RelatedQuestion(question=q) for q in m.relatedQuestions] if m.relatedQuestions else []
                        thinking = m.thinking if m.thinking else []
                        
                        messages.append(Message(
                            id=m.id,
                            role=m.role,
                            content=m.content,
                            sources=sources,
                            relatedQuestions=related,
                            thinking=thinking,
                            timestamp=m.timestamp
                        ))
                convs.append(Conversation(
                    id=c.id,
                    title=c.title,
                    timestamp=c.timestamp,
                    messages=messages
                ))
            return convs
        except Exception as e:
            logger.error(f"PostgreSQL fetch failed: {e}. Falling back to in-memory.")
            
    # Fallback to in-memory conversations for this user
    user_key_prefix = f"{user_id}:"
    items = [
        conv for key, conv in IN_MEMORY_CONVS.items() 
        if key.startswith(user_key_prefix)
    ]
    items.sort(key=lambda x: x.timestamp, reverse=True)
    return items

@router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Get details of a single conversation thread, validating ownership.
    """
    if db_helper.prisma and db_helper.prisma.is_connected():
        try:
            c = await db_helper.prisma.conversation.find_unique(
                where={"id": conversation_id},
                include={"messages": True}
            )
            if c:
                if c.userId != user_id:
                    raise HTTPException(status_code=404, detail="Conversation not found")
                
                messages = []
                if c.messages:
                    sorted_msgs = sorted(c.messages, key=lambda m: m.timestamp)
                    for m in sorted_msgs:
                        sources = [Source(source=s) for s in m.sources] if m.sources else []
                        related = [RelatedQuestion(question=q) for q in m.relatedQuestions] if m.relatedQuestions else []
                        thinking = m.thinking if m.thinking else []
                        
                        messages.append(Message(
                            id=m.id,
                            role=m.role,
                            content=m.content,
                            sources=sources,
                            relatedQuestions=related,
                            thinking=thinking,
                            timestamp=m.timestamp
                        ))
                return Conversation(
                    id=c.id,
                    title=c.title,
                    timestamp=c.timestamp,
                    messages=messages
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"PostgreSQL find failed: {e}. Checking in-memory.")

    user_conv_key = f"{user_id}:{conversation_id}"
    if user_conv_key in IN_MEMORY_CONVS:
        return IN_MEMORY_CONVS[user_conv_key]
        
    raise HTTPException(status_code=404, detail="Conversation not found")

@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(conversation_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Delete a conversation thread, validating ownership.
    """
    deleted = False
    if db_helper.prisma and db_helper.prisma.is_connected():
        try:
            c = await db_helper.prisma.conversation.find_unique(
                where={"id": conversation_id}
            )
            if not c or c.userId != user_id:
                raise HTTPException(status_code=404, detail="Conversation not found")
                
            # Delete conversation (Cascade delete handles messages automatically)
            await db_helper.prisma.conversation.delete(
                where={"id": conversation_id}
            )
            deleted = True
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"PostgreSQL delete failed: {e}. Trying in-memory.")
            
    user_conv_key = f"{user_id}:{conversation_id}"
    if user_conv_key in IN_MEMORY_CONVS:
        del IN_MEMORY_CONVS[user_conv_key]
        deleted = True
        
    if deleted:
        return
        
    raise HTTPException(status_code=404, detail="Conversation not found")

@router.post("", response_model=ChatResponse)
async def chat_query(request: ChatRequest, user_id: Optional[str] = Depends(get_optional_user_id)):
    """
    Submit query, generate response, and store the conversation. If user_id is provided, links it to user.
    """
    conv_id = request.conversationId
    query = request.query
    
    title = query[:40] + ("..." if len(query) > 40 else "")
    timestamp_str = datetime.datetime.utcnow().isoformat() + "Z"
    
    existing_messages = []
    
    # 1. Load conversation history
    if conv_id:
        if db_helper.prisma and db_helper.prisma.is_connected():
            try:
                c = await db_helper.prisma.conversation.find_unique(
                    where={"id": conv_id},
                    include={"messages": True}
                )
                if c:
                    # Validate ownership if the conversation has a user linked to it
                    if c.userId and c.userId != user_id:
                        # Reject accessing other user's conversation by generating a new thread
                        conv_id = str(uuid.uuid4())
                    else:
                        title = c.title
                        if c.messages:
                            sorted_msgs = sorted(c.messages, key=lambda m: m.timestamp)
                            for m in sorted_msgs:
                                sources = [Source(source=s) for s in m.sources] if m.sources else []
                                related = [RelatedQuestion(question=q) for q in m.relatedQuestions] if m.relatedQuestions else []
                                thinking = m.thinking if m.thinking else []
                                
                                existing_messages.append({
                                    "id": m.id,
                                    "role": m.role,
                                    "content": m.content,
                                    "sources": [s.model_dump() for s in sources],
                                    "relatedQuestions": [q.model_dump() for q in related],
                                    "thinking": thinking,
                                    "timestamp": m.timestamp
                                })
            except Exception as e:
                logger.error(f"PostgreSQL history load failed: {e}")
                
        user_conv_key = f"{user_id or 'anon'}:{conv_id}"
        if not existing_messages and user_conv_key in IN_MEMORY_CONVS:
            existing_messages = [m.model_dump(by_alias=True) for m in IN_MEMORY_CONVS[user_conv_key].messages]
            title = IN_MEMORY_CONVS[user_conv_key].title
    else:
        conv_id = str(uuid.uuid4())

    # 2. Append User Message
    user_msg_id = str(uuid.uuid4())
    user_message = {
        "id": user_msg_id,
        "role": "user",
        "content": query,
        "timestamp": timestamp_str
    }
    existing_messages.append(user_message)

    # 3. Call LLM Service
    ALLOWED_MODELS = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b"
    ]
    if request.model and request.model not in ALLOWED_MODELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Model '{request.model}' is not supported. Choose from {ALLOWED_MODELS}"
        )

    history_params = []
    for msg in existing_messages[:-1]:
        history_params.append(
            MessageHistory(role=msg["role"], content=msg["content"])
        )
        
    try:
        response_data = await groq_service.generate_answer(
            query=query,
            history=history_params,
            model=request.model,
            web_search=request.webSearch if request.webSearch is not None else True
        )
    except Exception as e:
        logger.error(f"LLM generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating answer: {str(e)}"
        )

    # 4. Append Assistant Message
    assistant_msg_id = str(uuid.uuid4())
    assistant_message = {
        "id": assistant_msg_id,
        "role": "assistant",
        "content": response_data["answer"],
        "sources": [s.model_dump() for s in response_data["sources"]],
        "relatedQuestions": [q.model_dump() for q in response_data["relatedQuestions"]],
        "thinking": response_data["thinking"],
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    existing_messages.append(assistant_message)

    # 5. Persist to DB or Memory
    persisted = False
    if db_helper.prisma and db_helper.prisma.is_connected():
        try:
            # Upsert the Conversation parent, linking to user_id if logged in
            conversation_data = {
                "id": conv_id,
                "title": title,
                "timestamp": timestamp_str,
            }
            if user_id:
                conversation_data["userId"] = user_id
                
            await db_helper.prisma.conversation.upsert(
                where={"id": conv_id},
                data={
                    "create": conversation_data,
                    "update": {
                        "title": title,
                        "timestamp": timestamp_str,
                    }
                }
            )
            
            # Create user message record
            await db_helper.prisma.message.create(
                data={
                    "id": user_msg_id,
                    "role": "user",
                    "content": query,
                    "sources": Json(None),
                    "relatedQuestions": Json(None),
                    "thinking": Json(None),
                    "timestamp": timestamp_str,
                    "conversationId": conv_id
                }
            )
            
            # Create assistant message record
            src_data = assistant_message["sources"] if assistant_message["sources"] else None
            rq_data = assistant_message["relatedQuestions"] if assistant_message["relatedQuestions"] else None
            th_data = assistant_message["thinking"] if assistant_message["thinking"] else None
            await db_helper.prisma.message.create(
                data={
                    "id": assistant_msg_id,
                    "role": "assistant",
                    "content": response_data["answer"],
                    "sources": Json(src_data),
                    "relatedQuestions": Json(rq_data),
                    "thinking": Json(th_data),
                    "timestamp": assistant_message["timestamp"],
                    "conversationId": conv_id
                }
            )
            persisted = True
        except Exception as e:
            logger.error(f"PostgreSQL save failed: {e}. Falling back to in-memory.")

    if not persisted:
        user_conv_key = f"{user_id or 'anon'}:{conv_id}"
        IN_MEMORY_CONVS[user_conv_key] = Conversation(
            id=conv_id,
            title=title,
            timestamp=timestamp_str,
            messages=[Message(**m) for m in existing_messages]
        )

    return ChatResponse(
        answer=response_data["answer"],
        sources=response_data["sources"],
        relatedQuestions=response_data["relatedQuestions"],
        thinking=response_data["thinking"],
        conversationId=conv_id,
        title=title
    )

@router.get("/models", response_model=List[str], status_code=status.HTTP_200_OK)
async def list_models():
    """
    Returns list of supported Groq models.
    """
    return [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b"
    ]

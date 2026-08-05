import os
import asyncio
import logging
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from app.config import settings
from app.schemas.chat import MessageHistory, Source, RelatedQuestion
from app.services.search_service import search_service
from typing import List, Dict, Any

logger = logging.getLogger("uvicorn")

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.is_configured = bool(self.api_key and not self.api_key.startswith("gsk_your_actual_key"))
        if self.is_configured:
            # Small LLM for routing, query enhancement, direct answering, and related questions
            self.llm_small = ChatGroq(
                api_key=self.api_key,
                model="llama-3.1-8b-instant",
                temperature=0.1
            )
            # Large LLM for complex context synthesis and citation generation
            self.llm_large = ChatGroq(
                api_key=self.api_key,
                model=settings.GROQ_MODEL,
                temperature=0.2
            )
        else:
            self.llm_small = None
            self.llm_large = None

    async def generate_answer(self, query: str, history: List[MessageHistory], model: str = None, web_search: bool = True) -> Dict[str, Any]:
        # Handle fallback mode if not configured
        if not self.is_configured or not self.llm_small:
            # Let's run a fallback check by searching anyway (which works without Groq key)
            thinking_steps = ["Analyzing query...", "Routing query...", "Searching web & crawling pages (5 results)...", "Synthesizing results (fallback mode)..."]
            sources, _ = await search_service.search_and_crawl(query)
            
            sources_summary = "\n".join([
                f"- **[{src.id}]** [{src.title}]({src.url}): {src.description[:100]}..." 
                for src in sources[:5]
            ])
            fallback_answer = (
                f"### Web Search & Crawling Results for: '{query}'\n\n"
                f"Oryn successfully queried the web and retrieved 5 results. Here is a preview of the top crawled sources:\n\n"
                f"{sources_summary}\n\n"
                f"> **Note:** Groq API key is not configured. "
                f"Please update the `GROQ_API_KEY` in the server's `.env` file to enable LangChain query routing and LLM synthesis."
            )
            return {
                "answer": fallback_answer,
                "sources": sources,
                "relatedQuestions": [
                    RelatedQuestion(id=1, text="How to configure the Groq API key?"),
                    RelatedQuestion(id=2, text="Tell me more about search query routing.")
                ],
                "thinking": thinking_steps
            }

        loop = asyncio.get_running_loop()
        
        # 1. Routing Analysis: Does the query require web search?
        if not web_search:
            needs_search = "NO"
            logger.info(f"Query Routing Bypassed: web_search toggle set to False for query '{query}'")
        else:
            router_system_prompt = (
                "You are an AI query router. Your role is to determine if answering the user's latest query requires web search to get real-time information, current news, specific online facts, weather, or real-time details.\n"
                "Respond with 'YES' if it requires web search.\n"
                "Respond with 'NO' if it is a general knowledge question (e.g. general math, science, programming), a direct request (e.g. write code, translate), a greeting (e.g. hi, hello), or a conversational message.\n"
                "Respond with ONLY 'YES' or 'NO', nothing else."
            )
            
            router_messages = [SystemMessage(content=router_system_prompt)]
            for msg in history[-3:]:
                if msg.role == "user":
                    router_messages.append(HumanMessage(content=msg.content))
                else:
                    router_messages.append(AIMessage(content=msg.content))
            router_messages.append(HumanMessage(content=f"Does this query require web search? Query: '{query}'"))

            try:
                router_response = await loop.run_in_executor(
                    None,
                    lambda: self.llm_small.invoke(router_messages)
                )
                needs_search = router_response.content.strip().upper()
            except Exception as e:
                logger.error(f"Routing check failed: {e}. Defaulting to YES.")
                needs_search = "YES"

        logger.info(f"Query Routing Analysis: needs_search = '{needs_search}' for query '{query}'")

        # 2. Case NO: Answer directly with the LLM (saves latency & tokens)
        if "YES" not in needs_search:
            thinking_steps = ["Analyzing query...", "Routing query (Direct Answer)...", "Generating answer..."]
            
            system_prompt = (
                "You are Oryn, a helpful and sophisticated AI Answer Engine. "
                "Answer the user's query directly and comprehensively. "
                "Structure your response beautifully using markdown: bold headings, list bullets, and code snippets where relevant."
            )
            
            messages = [SystemMessage(content=system_prompt)]
            for msg in history:
                if msg.role == "user":
                    messages.append(HumanMessage(content=msg.content))
                else:
                    messages.append(AIMessage(content=msg.content))
            messages.append(HumanMessage(content=query))
            
            # Instantiate model (with custom model support if requested)
            direct_model = ChatGroq(
                api_key=self.api_key,
                model=model or "llama-3.1-8b-instant",
                temperature=0.2
            ) if model else self.llm_small

            try:
                response = await loop.run_in_executor(
                    None,
                    lambda: direct_model.invoke(messages)
                )
                answer = response.content
            except Exception as e:
                logger.error(f"LLM direct invoke failed: {e}")
                answer = f"Error generating direct answer: {str(e)}"
                
            related_questions = [
                RelatedQuestion(id=1, text=f"Tell me more about related concepts to {query}."),
                RelatedQuestion(id=2, text="Show me an practical code example.")
            ]
            
            return {
                "answer": answer,
                "sources": [],
                "relatedQuestions": related_questions,
                "thinking": thinking_steps
            }

        # 3. Case YES: Web Search RAG Pipeline
        thinking_steps = ["Analyzing query...", "Routing query (Web Search required)...", "Enhancing query for web search..."]
        
        # Optimize query for search using ChatGroq small LLM
        enhancer_system = (
            "You are a search query enhancer. Analyze the conversation and user's query, "
            "then generate a single, highly optimized web search query to find the best relevant facts.\n"
            "Output ONLY the plain text search query. No quotes, explanations, or labels."
        )
        enhancer_messages = [SystemMessage(content=enhancer_system)]
        for msg in history[-3:]:
            if msg.role == "user":
                enhancer_messages.append(HumanMessage(content=msg.content))
            else:
                enhancer_messages.append(AIMessage(content=msg.content))
        enhancer_messages.append(HumanMessage(content=f"Enhance this query for search: {query}"))
        
        try:
            enhancer_response = await loop.run_in_executor(
                None,
                lambda: self.llm_small.invoke(enhancer_messages)
            )
            enhanced_query = enhancer_response.content.strip()
            if (enhanced_query.startswith('"') and enhanced_query.endswith('"')) or (enhanced_query.startswith("'") and enhanced_query.endswith("'")):
                enhanced_query = enhanced_query[1:-1]
        except Exception as e:
            logger.error(f"Query enhancement failed: {e}. Using original.")
            enhanced_query = query
            
        logger.info(f"Enhanced search query: '{query}' -> '{enhanced_query}'")

        # 4. Search and Crawl (retrieving 5 results)
        thinking_steps.append("Searching web & crawling pages (5 results)...")
        sources, contexts = await search_service.search_and_crawl(enhanced_query)
        
        thinking_steps.append("Reading sources...")
        
        # Build context prompt
        sources_context = ""
        for idx, ctx in enumerate(contexts, 1):
            url_str = sources[idx-1].url if idx-1 < len(sources) else ""
            title_str = sources[idx-1].title if idx-1 < len(sources) else ""
            sources_context += f"Source [{idx}]:\nURL: {url_str}\nTitle: {title_str}\nContent: {ctx}\n\n"

        system_prompt = (
            "You are Oryn, a helpful and sophisticated AI Answer Engine. "
            "Your task is to answer the user's query comprehensively and accurately using the provided search sources context. "
            "Follow these guidelines strictly:\n"
            "1. Answer the query based on the provided search context. If the context does not contain enough information, state this but answer to the best of your ability.\n"
            "2. Cite the search sources using bracketed numbers (e.g. [1], [2], [3]) inline next to the statements you are referencing. Do NOT use markdown links for citations, only simple bracket numbers.\n"
            "3. Format your response beautifully using markdown: bold headings, bullet points, numbered lists, tables, and code snippets where relevant.\n"
            "4. Keep the tone professional, objective, precise, and informative."
        )

        messages = [
            SystemMessage(content=f"{system_prompt}\n\nHere is the search context:\n{sources_context}")
        ]
        for msg in history:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            else:
                messages.append(AIMessage(content=msg.content))
        messages.append(HumanMessage(content=query))

        thinking_steps.append("Generating citation-rich answer...")
        
        try:
            # Instantiate Large LLM (with custom model support if requested)
            large_model = ChatGroq(
                api_key=self.api_key,
                model=model or settings.GROQ_MODEL,
                temperature=0.2
            ) if model else self.llm_large
            
            response = await loop.run_in_executor(
                None,
                lambda: large_model.invoke(messages)
            )
            answer = response.content
        except Exception as e:
            logger.error(f"Large LLM invoke failed: {e}")
            answer = f"Error generating answer: {str(e)}"
            
        # 5. Generate related questions using small LLM
        try:
            related_prompt = (
                f"Given the user query: '{query}' and the following answer context: '{answer[:300]}', "
                f"generate 3 short, engaging follow-up questions the user might ask next. "
                f"Format your response as a simple list with 1 per line, without numbers or punctuation prefix."
            )
            related_response = await loop.run_in_executor(
                None,
                lambda: self.llm_small.invoke([HumanMessage(content=related_prompt)])
            )
            lines = related_response.content.splitlines()
            related_questions = []
            q_id = 1
            for line in lines:
                cleaned_line = line.strip().lstrip("1234567890.-* ")
                if cleaned_line and len(cleaned_line) > 5:
                    related_questions.append(RelatedQuestion(id=q_id, text=cleaned_line))
                    q_id += 1
        except Exception:
            related_questions = []

        if not related_questions:
            related_questions = [
                RelatedQuestion(id=1, text=f"Can you explain more details about {query}?"),
                RelatedQuestion(id=2, text="What are the applications of this?"),
                RelatedQuestion(id=3, text="Where can I find more resources?")
            ]

        return {
            "answer": answer,
            "sources": sources,
            "relatedQuestions": related_questions,
            "thinking": thinking_steps
        }

# Instantiate singleton
groq_service = GroqService()

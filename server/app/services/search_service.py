import logging
import asyncio
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse, parse_qs
from typing import List, Dict, Any, Tuple
from groq import Groq
from duckduckgo_search import DDGS
from app.config import settings
from app.schemas.chat import MessageHistory, Source

logger = logging.getLogger("uvicorn")

class SearchService:
    def __init__(self):
        self.groq_api_key = settings.GROQ_API_KEY
        self.is_configured = bool(self.groq_api_key and not self.groq_api_key.startswith("gsk_your_actual_key"))
        if self.is_configured:
            self.groq_client = Groq(api_key=self.groq_api_key)
        else:
            self.groq_client = None

    async def enhance_query(self, query: str, history: List[MessageHistory]) -> str:
        """
        Uses Groq LLM to rewrite and enhance the user's conversational query into a search query.
        """
        if not self.is_configured or not self.groq_client:
            logger.warning("Groq not configured for query enhancer. Using original query.")
            return query

        system_prompt = (
            "You are a search query enhancer. Your goal is to analyze the conversation and the user's latest query, "
            "then generate a single, highly optimized web search query that will return the most accurate and up-to-date results. "
            "Follow these rules:\n"
            "1. Output ONLY the plain text search query.\n"
            "2. Do NOT include quotes, explanations, labels, introduction, or markdown.\n"
            "3. Optimize the keywords for web search (e.g. resolve references like 'he', 'it', 'yesterday', 'latest').\n"
            "4. Keep it concise."
        )

        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": f"Enhance this query for search: {query}"})

        try:
            loop = asyncio.get_running_loop()
            chat_completion = await loop.run_in_executor(
                None,
                lambda: self.groq_client.chat.completions.create(
                    messages=messages,
                    model=settings.GROQ_MODEL,
                    temperature=0.1,
                    max_tokens=60,
                )
            )
            enhanced = chat_completion.choices[0].message.content.strip()
            # Clean up quotes if LLM accidentally put them
            if (enhanced.startswith('"') and enhanced.endswith('"')) or (enhanced.startswith("'") and enhanced.endswith("'")):
                enhanced = enhanced[1:-1]
            logger.info(f"Enhanced query: '{query}' -> '{enhanced}'")
            return enhanced
        except Exception as e:
            logger.error(f"Error in query enhancer: {e}. Falling back to original.")
            return query

    async def scrape_ddg_html(self, query: str) -> List[Dict[str, Any]]:
        """
        Scrapes duckduckgo html search directly for robustness.
        """
        url = "https://html.duckduckgo.com/html/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9"
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, data={"q": query}, headers=headers, timeout=5.0)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, "html.parser")
                    results = []
                    # Find all result divs
                    for result in soup.select(".result"):
                        title_el = result.select_one(".result__title a")
                        snippet_el = result.select_one(".result__snippet")
                        if title_el and snippet_el:
                            title = title_el.get_text(strip=True)
                            href = title_el.get("href")
                            
                            # Clean redirect links
                            if href and "uddg=" in href:
                                parsed_href = urlparse(href)
                                queries = parse_qs(parsed_href.query)
                                if "uddg" in queries:
                                    href = queries["uddg"][0]
                                    
                            snippet = snippet_el.get_text(strip=True)
                            results.append({
                                "title": title,
                                "href": href,
                                "body": snippet
                            })
                            if len(results) >= 5:
                                break
                    return results
        except Exception as e:
            logger.error(f"Error scraping DDG HTML: {e}")
        return []

    async def crawl_page(self, url: str, client: httpx.AsyncClient) -> str:
        """
        Asynchronously fetches a webpage and extracts clean readable text.
        """
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            # Fetch content with a timeout
            response = await client.get(url, headers=headers, timeout=2.0, follow_redirects=True)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                
                # Remove boilerplate scripts, styles, header, footer, nav
                for element in soup(["script", "style", "nav", "footer", "header", "noscript"]):
                    element.decompose()
                
                # Extract text
                text = soup.get_text(separator=" ")
                # Clean whitespace
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                cleaned_text = " ".join(chunk for chunk in chunks if chunk)
                
                # Truncate to reasonable context window size
                return cleaned_text[:1200]
        except Exception as e:
            logger.debug(f"Failed to crawl page '{url}': {e}")
        return ""

    async def search_and_crawl(self, query: str) -> Tuple[List[Source], List[str]]:
        """
        Queries DuckDuckGo for the top 10 results, crawling the body content of top results.
        Returns a tuple of (sources: List[Source], contexts: List[str]).
        """
        logger.info(f"Performing search & crawl for query: '{query}'")
        
        # 1. Scraping HTML directly (primary robust method)
        raw_results = await self.scrape_ddg_html(query)
        
        # 2. Fallback to DDGS library if direct scraping failed
        if not raw_results:
            logger.info("Direct DDG HTML scraping returned no results. Trying DDGS library...")
            try:
                def run_search():
                    with DDGS() as ddgs:
                        return list(ddgs.text(query, max_results=5))
                
                loop = asyncio.get_running_loop()
                raw_results = await loop.run_in_executor(None, run_search)
            except Exception as e:
                logger.error(f"DDGS library fallback search failed: {e}")
            
        if not raw_results:
            logger.warning("No search results returned from both scraping and DDGS.")
            return [], []

        # 3. Build list of source metadata
        sources = []
        for idx, res in enumerate(raw_results, 1):
            title = res.get("title", f"Result {idx}")
            url = res.get("href", "")
            snippet = res.get("body", "")
            
            # Generate favicon from domain
            favicon = "🌐"
            if url:
                parsed = urlparse(url)
                favicon = f"{parsed.scheme}://{parsed.netloc}/favicon.ico"

            sources.append({
                "id": idx,
                "title": title,
                "url": url,
                "description": snippet,
                "favicon": favicon,
                "crawled_content": ""
            })

        # 4. Asynchronously crawl top 3 pages for rich citations, to avoid slowing down overall search response
        top_sources_to_crawl = sources[:3]
        async with httpx.AsyncClient() as client:
            tasks = [self.crawl_page(src["url"], client) for src in top_sources_to_crawl]
            crawled_texts = await asyncio.gather(*tasks, return_exceptions=True)
            
            for src, text in zip(top_sources_to_crawl, crawled_texts):
                if isinstance(text, str) and text:
                    src["crawled_content"] = text
                    if not src["description"]:
                        src["description"] = text[:200]
                else:
                    src["crawled_content"] = src["description"]

        # Convert back to Source pydantic models
        typed_sources = []
        for src in sources:
            content_summary = src["crawled_content"] or src["description"]
            typed_sources.append(Source(
                id=src["id"],
                title=src["title"],
                url=src["url"],
                description=src["description"],
                favicon=src["favicon"]
            ))
            src["final_context"] = content_summary

        return typed_sources, [src.get("final_context", src["description"]) for src in sources]

search_service = SearchService()

"""Retry logic with exponential backoff for web requests."""
import asyncio
import aiohttp
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class RetryableSession:
    """HTTP session with built-in retry logic."""
    
    def __init__(self, max_retries: int = 5, base_delay: float = 1.0):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=1, max=60),
        retry=retry_if_exception_type((aiohttp.ClientError, asyncio.TimeoutError))
    )
    async def get(self, url: str, **kwargs) -> str:
        """Perform GET request with automatic retry on failure."""
        if not self.session:
            raise RuntimeError("Session not initialized. Use async context manager.")
            
        logger.debug(f"Fetching URL: {url}")
        
        async with self.session.get(url, **kwargs) as response:
            response.raise_for_status()
            return await response.text()
    
    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=1, max=60),
        retry=retry_if_exception_type((aiohttp.ClientError, asyncio.TimeoutError))
    )
    async def get_json(self, url: str, **kwargs) -> Dict[str, Any]:
        """Perform GET request and return JSON with automatic retry."""
        if not self.session:
            raise RuntimeError("Session not initialized. Use async context manager.")
            
        logger.debug(f"Fetching JSON from URL: {url}")
        
        async with self.session.get(url, **kwargs) as response:
            response.raise_for_status()
            return await response.json()
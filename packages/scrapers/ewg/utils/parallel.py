"""Parallel processing utilities with rate limiting."""
import asyncio
from asyncio_throttle import Throttler
from typing import List, Callable, Any, TypeVar, Coroutine, Optional
import logging
from rich.console import Console

T = TypeVar('T')
console = Console()
logger = logging.getLogger(__name__)


class ParallelProcessor:
    """Process items in parallel with rate limiting."""
    
    def __init__(self, max_concurrent: int = 10, rate_limit: float = 10.0):
        """
        Initialize parallel processor.
        
        Args:
            max_concurrent: Maximum number of concurrent tasks
            rate_limit: Maximum requests per second
        """
        self.max_concurrent = max_concurrent
        self.throttler = Throttler(rate_limit=rate_limit)
        
    async def process_batch(
        self,
        items: List[T],
        process_func: Callable[[T], Coroutine[Any, Any, Any]],
        progress_callback: Optional[Callable[[T, Any], None]] = None
    ) -> List[Any]:
        """
        Process items in parallel batches.
        
        Args:
            items: List of items to process
            process_func: Async function to process each item
            progress_callback: Optional callback for progress updates
            
        Returns:
            List of results in same order as input items
        """
        semaphore = asyncio.Semaphore(self.max_concurrent)
        
        async def process_with_limit(item: T, index: int) -> tuple[int, Any]:
            async with semaphore:
                async with self.throttler:
                    try:
                        result = await process_func(item)
                        if progress_callback:
                            progress_callback(item, result)
                        return index, result
                    except Exception as e:
                        logger.error(f"Error processing item {item}: {e}")
                        return index, None
        
        # Create tasks with index to preserve order
        tasks = [process_with_limit(item, i) for i, item in enumerate(items)]
        
        # Execute all tasks
        results = await asyncio.gather(*tasks)
        
        # Sort by index and extract results
        sorted_results = sorted(results, key=lambda x: x[0])
        return [result for _, result in sorted_results]
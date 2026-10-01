"""
CAMPUSLINK — Shared Groq LLM Client
Handles model discovery, client instantiation, and resilient LLM completions.
Includes timeout, retry with exponential backoff (max 2 retries), and
graceful fallback when Groq fails or rate-limits.
"""

import os
import json
import time
from dotenv import load_dotenv
load_dotenv()
from typing import Optional, Dict, Any

_client = None
_selected_model = None

# Default timeout for LLM calls (seconds). First request after cold start
# gets a longer timeout to account for Render free-tier spin-up.
DEFAULT_TIMEOUT_S = 15
COLD_START_TIMEOUT_S = 30
_first_request_done = False


def get_groq_client():
    """Get or create singleton Groq client."""
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            return None
        try:
            from groq import Groq
            _client = Groq(api_key=api_key)
        except Exception as e:
            print(f"  [LLM] Error initializing Groq client: {e}")
            return None
    return _client


def get_active_model(client) -> str:
    """Dynamically determine the best available text generation model."""
    global _selected_model
    if _selected_model:
        return _selected_model

    # 1. Check explicit environment override
    override = os.getenv("GROQ_MODEL")
    if override:
        _selected_model = override
        return _selected_model

    # 2. Preferred models ordered by preference
    preferred = [
        "openai/gpt-oss-20b",
        "openai/gpt-oss-120b",
        "qwen/qwen3.8-27b",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
    ]

    try:
        available = {m.id for m in client.models.list().data}
        for pref in preferred:
            if pref in available:
                _selected_model = pref
                print(f"  [LLM] Selected Groq model: {_selected_model}")
                return _selected_model
        # Fallback to first non-whisper/non-guard model
        for m in available:
            if "whisper" not in m and "guard" not in m and "orpheus" not in m:
                _selected_model = m
                print(f"  [LLM] Using fallback model: {_selected_model}")
                return _selected_model
    except Exception as e:
        print(f"  [LLM] Model auto-discovery warning: {e}")

    _selected_model = "openai/gpt-oss-20b"
    return _selected_model


def _get_timeout() -> float:
    """Return timeout in seconds, longer for first request (cold start)."""
    global _first_request_done
    if not _first_request_done:
        _first_request_done = True
        return COLD_START_TIMEOUT_S
    return DEFAULT_TIMEOUT_S


def _call_with_retry(client, model: str, messages: list, temperature: float,
                     max_tokens: int, response_format: Optional[dict] = None,
                     max_retries: int = 2) -> Optional[Any]:
    """Call Groq API with retry + exponential backoff.

    Retries up to max_retries times on transient failures (rate limits,
    timeouts, 5xx). Uses exponential backoff: 1s, 2s between retries.
    Falls back to alternate model on final retry.
    """
    timeout = _get_timeout()
    last_error = None

    for attempt in range(1 + max_retries):
        try:
            kwargs = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "timeout": timeout,
            }
            if response_format:
                kwargs["response_format"] = response_format

            response = client.chat.completions.create(**kwargs)
            return response

        except Exception as e:
            last_error = e
            err_str = str(e).lower()
            is_retryable = any(kw in err_str for kw in [
                "rate_limit", "rate limit", "429", "503", "502",
                "timeout", "timed out", "overloaded", "service unavailable",
                "connection", "temporarily",
            ])

            if not is_retryable or attempt >= max_retries:
                # On final attempt, try alternate model
                if attempt == max_retries - 1 and model != "llama-3.1-8b-instant":
                    model = "llama-3.1-8b-instant"
                    print(f"  [LLM] Switching to fallback model: {model}")
                elif attempt >= max_retries:
                    break

            backoff = min(2 ** attempt, 4)
            print(f"  [LLM] Attempt {attempt + 1} failed ({type(e).__name__}), retrying in {backoff}s...")
            time.sleep(backoff)

    print(f"  [LLM] All {1 + max_retries} attempts failed: {last_error}")
    return None


def call_groq_json(system_prompt: str, user_prompt: str, temperature: float = 0.5,
                   max_tokens: int = 800) -> Optional[Dict[str, Any]]:
    """Execute completion and parse JSON result. Retries with backoff on failure."""
    client = get_groq_client()
    if not client:
        return None

    model = get_active_model(client)
    capped_tokens = min(max_tokens, 800)

    response = _call_with_retry(
        client, model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
        max_tokens=capped_tokens,
        response_format={"type": "json_object"},
    )

    if response is None:
        return None

    try:
        content = response.choices[0].message.content.strip()
        return json.loads(content)
    except Exception as e:
        print(f"  [LLM] JSON parse error: {e}")
        return None


def call_groq_text(system_prompt: str, user_prompt: str, temperature: float = 0.3,
                   max_tokens: int = 600) -> Optional[str]:
    """Execute completion and return raw text. Retries with backoff on failure."""
    client = get_groq_client()
    if not client:
        return None

    model = get_active_model(client)
    capped_tokens = min(max_tokens, 600)

    response = _call_with_retry(
        client, model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
        max_tokens=capped_tokens,
    )

    if response is None:
        return None

    try:
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"  [LLM] Text extraction error: {e}")
        return None

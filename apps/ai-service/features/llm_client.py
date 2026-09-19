"""
CAMPUSLINK — Shared Groq LLM Client
Handles model discovery, client instantiation, and resilient LLM completions.
"""

import os
import json
from dotenv import load_dotenv
load_dotenv()
from typing import Optional, Dict, Any

_client = None
_selected_model = None


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


def call_groq_json(system_prompt: str, user_prompt: str, temperature: float = 0.5, max_tokens: int = 800) -> Optional[Dict[str, Any]]:
    """Execute completion and parse JSON result."""
    client = get_groq_client()
    if not client:
        return None

    model = get_active_model(client)
    capped_tokens = min(max_tokens, 800)
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=capped_tokens,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content.strip()
        return json.loads(content)
    except Exception as e:
        print(f"  [LLM] Groq API call failed ({model}): {e}")
        # Try fallback to openai/gpt-oss-20b if different
        if model != "openai/gpt-oss-20b":
            try:
                print("  [LLM] Retrying with fallback model openai/gpt-oss-20b...")
                response = client.chat.completions.create(
                    model="openai/gpt-oss-20b",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=temperature,
                    max_tokens=capped_tokens,
                    response_format={"type": "json_object"},
                )
                content = response.choices[0].message.content.strip()
                return json.loads(content)
            except Exception as e2:
                print(f"  [LLM] Fallback model failed: {e2}")
        return None


def call_groq_text(system_prompt: str, user_prompt: str, temperature: float = 0.3, max_tokens: int = 600) -> Optional[str]:
    """Execute completion and return raw text."""
    client = get_groq_client()
    if not client:
        return None

    model = get_active_model(client)
    capped_tokens = min(max_tokens, 600)
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=capped_tokens,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"  [LLM] Groq API call failed ({model}): {e}")
        if model != "openai/gpt-oss-20b":
            try:
                response = client.chat.completions.create(
                    model="openai/gpt-oss-20b",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=temperature,
                    max_tokens=capped_tokens,
                )
                return response.choices[0].message.content.strip()
            except Exception as e2:
                print(f"  [LLM] Fallback text model failed: {e2}")
        return None

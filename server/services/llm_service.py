"""
Unified LLM abstraction layer.

Supports Gemini (primary), Groq (fallback), and Ollama (local).
Every call is logged with provider name and latency.
"""

from __future__ import annotations

import abc
import logging
import time
from typing import Optional

import httpx
from google import genai
from google.genai import types as genai_types
from groq import Groq, APIStatusError as GroqAPIStatusError

from config import settings

logger = logging.getLogger(__name__)


# ── Abstract base ─────────────────────────────────────────────────────────────

class LLMProvider(abc.ABC):
    """Base class every provider must implement."""

    name: str = "base"

    @abc.abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> str:
        ...


# ── Gemini ────────────────────────────────────────────────────────────────────

class GeminiProvider(LLMProvider):
    name = "gemini"

    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        self.model = model
        self.client = genai.Client(api_key=api_key)

    async def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> str:
        config = genai_types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        )
        if system_prompt:
            config.system_instruction = system_prompt

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config,
        )
        return response.text or ""


# ── Groq ──────────────────────────────────────────────────────────────────────

class GroqProvider(LLMProvider):
    name = "groq"

    def __init__(self, api_key: str, model: str = "llama-3.1-70b-versatile"):
        self.model = model
        self.client = Groq(api_key=api_key)

    async def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> str:
        messages: list[dict] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""


# ── Ollama (local) ────────────────────────────────────────────────────────────

class OllamaProvider(LLMProvider):
    name = "ollama"

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "phi3:mini"):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> str:
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        payload = {
            "model": self.model,
            "prompt": full_prompt,
            "stream": False,
            "options": {"temperature": temperature, "num_predict": max_tokens},
        }
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(f"{self.base_url}/api/generate", json=payload)
            resp.raise_for_status()
            return resp.json().get("response", "")


# ── Orchestrator ──────────────────────────────────────────────────────────────

class LLMService:
    """Try primary provider, fall back on 429 / timeout / connection error."""

    def __init__(self, primary: LLMProvider, fallback: Optional[LLMProvider] = None):
        self.primary = primary
        self.fallback = fallback

    async def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> tuple[str, str, float]:
        """Return (text, provider_name, latency_ms)."""
        for provider in [self.primary, self.fallback]:
            if provider is None:
                continue
            start = time.perf_counter()
            try:
                text = await provider.generate(prompt, system_prompt, temperature, max_tokens)
                latency = (time.perf_counter() - start) * 1000
                logger.info(
                    "LLM OK  provider=%s latency=%.0fms tokens≈%d",
                    provider.name,
                    latency,
                    len(text.split()),
                )
                return text, provider.name, latency
            except (httpx.HTTPStatusError, GroqAPIStatusError) as exc:
                status = getattr(exc, "status_code", None) or getattr(getattr(exc, "response", None), "status_code", None)
                logger.warning(
                    "LLM FAIL provider=%s status=%s — trying fallback",
                    provider.name,
                    status,
                )
                # Always allow fallback on 429 and 400 (model may be deprecated).
                # For other errors from the primary, bubble up immediately.
                if status not in (429, 400) and provider == self.primary:
                    raise
            except (httpx.TimeoutException, httpx.ConnectError) as exc:
                logger.warning(
                    "LLM FAIL provider=%s error=%s — trying fallback",
                    provider.name,
                    type(exc).__name__,
                )
            except Exception as exc:
                logger.warning(
                    "LLM FAIL provider=%s error=%s — trying fallback",
                    provider.name,
                    exc,
                )

        raise RuntimeError("All LLM providers failed")


# ── Factory ───────────────────────────────────────────────────────────────────

def get_llm_service(mode: str = "cloud") -> LLMService:
    """
    mode:
      "cloud"  → Gemini primary, Groq fallback
      "local"  → Ollama only
      "groq"   → Groq primary, Gemini fallback
    """
    gemini = GeminiProvider(api_key=settings.gemini_api_key)
    groq = GroqProvider(api_key=settings.groq_api_key)
    ollama = OllamaProvider(base_url=settings.ollama_base_url, model=settings.ollama_model)

    if mode == "local":
        return LLMService(primary=ollama)
    elif mode == "groq":
        return LLMService(primary=groq, fallback=gemini)
    else:  # "cloud" (default)
        return LLMService(primary=gemini, fallback=groq)

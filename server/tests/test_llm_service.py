"""Tests for LLMService — provider routing, fallback on 429, timeout."""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

# We'll import from services after patching config so it doesn't require real keys
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ── Helpers ───────────────────────────────────────────────────────────────────

class FakeProvider:
    """A minimal LLMProvider stand-in for testing."""
    def __init__(self, name: str, response: str = "ok", fail: Exception | None = None):
        self.name = name
        self._response = response
        self._fail = fail
        self.called = False

    async def generate(self, prompt, system_prompt="", temperature=0.3, max_tokens=4096):
        self.called = True
        if self._fail:
            raise self._fail
        return self._response


# ── Tests ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_primary_provider_returns_response():
    from services.llm_service import LLMService
    primary = FakeProvider("test-primary", response="Recursion is when a function calls itself.")
    service = LLMService(primary=primary)

    text, provider, latency = await service.generate("Summarize the concept of recursion")

    assert "recursion" in text.lower() or "calls itself" in text.lower()
    assert provider == "test-primary"
    assert latency >= 0


@pytest.mark.asyncio
async def test_fallback_on_429():
    """When primary returns 429, service should fall back to secondary."""
    import httpx
    from services.llm_service import LLMService

    resp_429 = httpx.Response(429, request=httpx.Request("POST", "https://example.com"))
    primary = FakeProvider("gemini-mock", fail=httpx.HTTPStatusError("rate limit", request=resp_429.request, response=resp_429))
    fallback = FakeProvider("groq-mock", response="Fallback answer about recursion")
    service = LLMService(primary=primary, fallback=fallback)

    text, provider, latency = await service.generate("Summarize recursion")

    assert provider == "groq-mock"
    assert "Fallback" in text or "recursion" in text.lower()
    assert primary.called
    assert fallback.called


@pytest.mark.asyncio
async def test_fallback_on_timeout():
    """When primary times out, service should fall back."""
    import httpx
    from services.llm_service import LLMService

    primary = FakeProvider("gemini-mock", fail=httpx.TimeoutException("timeout"))
    fallback = FakeProvider("groq-mock", response="Timeout fallback")
    service = LLMService(primary=primary, fallback=fallback)

    text, provider, _ = await service.generate("test")

    assert provider == "groq-mock"


@pytest.mark.asyncio
async def test_all_providers_fail_raises():
    """If all providers blow up, RuntimeError is raised."""
    import httpx
    from services.llm_service import LLMService

    primary = FakeProvider("a", fail=httpx.ConnectError("down"))
    fallback = FakeProvider("b", fail=httpx.ConnectError("also down"))
    service = LLMService(primary=primary, fallback=fallback)

    with pytest.raises(RuntimeError, match="All LLM providers failed"):
        await service.generate("test")

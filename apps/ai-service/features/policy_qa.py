"""
Feature 10 — Placement Policy Q&A (RAG Pipeline)
Retrieval-Augmented Generation using Policy Markdown Documents + TF-IDF Vector Retrieval + Groq LLM.
Retrieves relevant policy chunks with cosine similarity and synthesizes accurate, cited answers.
"""

import os
import glob
import re
import math
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from features.llm_client import call_groq_text, get_groq_client


# ---- Schema ----

class PolicyQARequest(BaseModel):
    question: str = ""


class PolicySource(BaseModel):
    document: str
    content: str
    relevance_score: float = 0.0


class PolicyQAResponse(BaseModel):
    answer: str
    sources: List[PolicySource] = []
    confidence: float = 0.0
    source: str = "groq-rag"
    modelVersion: str = "policy-rag-v2"
    timestamp: str = ""


# ---- Policy Document Store & Vector Index ----

class PolicyChunk:
    def __init__(self, doc_name: str, section: str, text: str):
        self.doc_name = doc_name
        self.section = section
        self.text = text
        self.tokens = self._tokenize(text)

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        return [w.lower() for w in re.findall(r"\b[a-zA-Z0-9_-]{2,}\b", text)]


_chunks: List[PolicyChunk] = []
_idf: Dict[str, float] = {}
_initialized = False


def _get_policy_dir() -> str:
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, "data", "policies")


def initialize_rag() -> bool:
    """Load policy documents, chunk by section, and build TF-IDF vector index."""
    global _chunks, _idf, _initialized

    if _initialized:
        return True

    policy_dir = _get_policy_dir()
    md_files = glob.glob(os.path.join(policy_dir, "*.md"))
    if not md_files:
        print(f"  [Feature 10] No policy documents found in {policy_dir}")
        return False

    _chunks = []
    doc_freq: Dict[str, int] = {}

    for filepath in md_files:
        doc_name = os.path.basename(filepath)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            # Split document by headers
            sections = re.split(r"\n(?=#{1,3}\s)", content)
            for sec in sections:
                sec = sec.strip()
                if not sec or len(sec) < 20:
                    continue

                lines = sec.split("\n")
                first_line = lines[0].strip()
                section_title = first_line.lstrip("#").strip() if first_line.startswith("#") else "General Policy"
                body = "\n".join(lines[1:]).strip() if len(lines) > 1 else sec

                chunk = PolicyChunk(doc_name, section_title, f"{section_title}\n{body}")
                _chunks.append(chunk)

                # Count term frequencies across chunks
                unique_tokens = set(chunk.tokens)
                for t in unique_tokens:
                    doc_freq[t] = doc_freq.get(t, 0) + 1

        except Exception as e:
            print(f"  [Feature 10] Error reading {doc_name}: {e}")

    # Compute IDF
    N = len(_chunks)
    if N > 0:
        _idf = {t: math.log(1 + (N / df)) for t, df in doc_freq.items()}

    _initialized = True
    print(f"  [Feature 10] RAG initialized -- {len(_chunks)} policy chunks indexed from {len(md_files)} documents")
    return True


def _score_chunk(chunk: PolicyChunk, query_tokens: List[str]) -> float:
    """Compute BM25/TF-IDF relevance score for a chunk against query tokens."""
    if not query_tokens or not chunk.tokens:
        return 0.0

    score = 0.0
    chunk_len = len(chunk.tokens)
    avg_len = 80.0
    k1 = 1.2
    b = 0.75

    # Token count map
    tf_map: Dict[str, int] = {}
    for t in chunk.tokens:
        tf_map[t] = tf_map.get(t, 0) + 1

    for q in query_tokens:
        if q in tf_map:
            tf = tf_map[q]
            idf = _idf.get(q, 1.0)
            # BM25 term weighting
            term_score = idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (chunk_len / avg_len)))
            score += term_score

            # Boost exact title matches
            if q in chunk.section.lower():
                score += 1.5

    return score


def answer_policy_question(req: PolicyQARequest) -> PolicyQAResponse:
    """Answer placement policy questions using RAG (Context Retrieval + Groq LLM)."""
    initialize_rag()

    query = req.question.strip()
    if not query:
        return PolicyQAResponse(
            answer="Please ask a question about campus placement policies, eligibility, or offer rules.",
            sources=[],
            confidence=0.0,
            source="groq-rag",
            timestamp=datetime.now().isoformat(),
        )

    # 1. Retrieve most relevant chunks
    query_tokens = [w.lower() for w in re.findall(r"\b[a-zA-Z0-9_-]{2,}\b", query)]
    scored_chunks = []
    for chunk in _chunks:
        s = _score_chunk(chunk, query_tokens)
        if s > 0:
            scored_chunks.append((s, chunk))

    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    top_results = scored_chunks[:4]

    # If no relevant chunks found
    if not top_results:
        return PolicyQAResponse(
            answer="This query is not covered in the current placement policy documents. Please consult the Training & Placement Office (TPO) for official guidance.",
            sources=[],
            confidence=0.2,
            source="groq-rag",
            timestamp=datetime.now().isoformat(),
        )

    # 2. Build context string
    context_blocks = []
    sources = []
    max_score = top_results[0][0]

    for score, chunk in top_results:
        norm_score = round(min(1.0, score / (max_score + 1e-5)), 2)
        context_blocks.append(f"[{chunk.doc_name} — {chunk.section}]\n{chunk.text}")
        sources.append(PolicySource(
            document=f"{chunk.doc_name} ({chunk.section})",
            content=chunk.text[:220].replace("\n", " ").strip() + "...",
            relevance_score=norm_score,
        ))

    context_str = "\n\n---\n\n".join(context_blocks)

    # 3. Groq LLM Synthesis
    system_prompt = (
        "You are an authoritative campus placement policy advisor for an Indian engineering college. "
        "Answer the student's question accurately and strictly based on the provided policy documents below. "
        "Be concise, clear, and direct. Mention key thresholds (CGPA, LPA, deadlines, penalties) explicitly. "
        "Organize multi-point answers into clean bullet points with bold keywords (e.g. - **General eligibility**: 6.0 CGPA). "
        "Place any important caveats or exceptions in a **Note**: line at the end. "
        "Cite the document name or policy rule when relevant. "
        "If the answer is not mentioned in the context, state that clearly."
    )

    user_prompt = (
        f"Policy Documents Context:\n\n{context_str}\n\n"
        f"Student's Question: {query}\n\n"
        f"Provide a clear, accurate, and helpful response for the student:"
    )

    llm_answer = call_groq_text(system_prompt, user_prompt, temperature=0.2, max_tokens=600)

    if not llm_answer:
        # Fallback to direct excerpt if LLM unavailable
        best_chunk = top_results[0][1]
        llm_answer = f"Based on {best_chunk.doc_name} ({best_chunk.section}):\n\n{best_chunk.text}"

    # Calculate overall confidence
    confidence = min(0.95, round(0.65 + (len(top_results) * 0.08), 2))

    return PolicyQAResponse(
        answer=llm_answer,
        sources=sources,
        confidence=confidence,
        source="groq-rag",
        modelVersion="policy-rag-v2",
        timestamp=datetime.now().isoformat(),
    )

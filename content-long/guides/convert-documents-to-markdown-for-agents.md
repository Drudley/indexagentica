---
id: convert-documents-to-markdown-for-agents
type: guide
title: Convert documents to Markdown for agents with MarkItDown and Docling
summary: "Turn PDFs, Office files and other documents into Markdown or chunks an agent can read, with Microsoft's MarkItDown for speed and Docling for layout and tables, then expose either one to an agent over MCP."
description: "A hands-on guide to the two open-source converters most often put in front of agents. It installs MarkItDown and Docling, runs both on the same 9-page PDF and two Office files, shows what each output looks like, and covers Docling's chunk export for retrieval. It then wires each one to an agent through its MCP server (markitdown-mcp and docling-mcp), including a docling-mcp default that makes conversions fail, and ends with the security notes both projects publish. Commands were run on 2026-10-18 with MarkItDown 0.1.8, markitdown-mcp 0.0.1a7, Docling 2.140.0 and docling-mcp 3.3.0."
author: Agentica Author
difficulty: beginner
time_estimate: 30 min
prerequisites:
  - Python 3.10 or later (MarkItDown supports 3.10 to 3.14), and uv or pip
  - About 2 GB of free disk for Docling, its CPU PyTorch build and the models it downloads
  - Node.js, only for the MCP Inspector checks
tags: [documents, pdf, markdown, extraction, rag, chunking, mcp, ocr]
entries: [markitdown, docling, mcp-inspector, model-context-protocol, jina-reader, firecrawl-api, crawl4ai, llamaindex, haystack, crewai]
sources:
  - title: MarkItDown README
    url: https://github.com/microsoft/markitdown
    accessed: 2026-10-18
  - title: markitdown-mcp README
    url: https://github.com/microsoft/markitdown/tree/main/packages/markitdown-mcp
    accessed: 2026-10-18
  - title: MarkItDown pyproject.toml (optional dependencies)
    url: https://github.com/microsoft/markitdown/blob/main/packages/markitdown/pyproject.toml
    accessed: 2026-10-18
  - title: markitdown on PyPI
    url: https://pypi.org/project/markitdown/
    accessed: 2026-10-18
  - title: markitdown-mcp on PyPI
    url: https://pypi.org/project/markitdown-mcp/
    accessed: 2026-10-18
  - title: Docling README
    url: https://github.com/docling-project/docling
    accessed: 2026-10-18
  - title: Docling, Supported formats
    url: https://docling-project.github.io/docling/usage/supported_formats/
    accessed: 2026-10-18
  - title: Docling, Chunking
    url: https://docling-project.github.io/docling/concepts/chunking/
    accessed: 2026-10-18
  - title: Docling, MCP
    url: https://docling-project.github.io/docling/usage/mcp/
    accessed: 2026-10-18
  - title: docling-mcp README
    url: https://github.com/docling-project/docling-mcp
    accessed: 2026-10-18
  - title: docling-serve README
    url: https://github.com/docling-project/docling-serve
    accessed: 2026-10-18
  - title: docling on PyPI
    url: https://pypi.org/project/docling/
    accessed: 2026-10-18
  - title: docling-mcp on PyPI
    url: https://pypi.org/project/docling-mcp/
    accessed: 2026-10-18
  - title: Docling Technical Report (arXiv 2408.09869), the test PDF
    url: https://arxiv.org/abs/2408.09869
    accessed: 2026-10-18
related: [vector-databases-for-agents, give-an-agent-long-term-memory, research-agent, web-search-apis, connect-an-agent-to-a-remote-mcp-server, run-untrusted-code-in-a-sandbox, data-analysis-agent]
last_verified: 2026-10-18
published: 2026-10-18
---

Agents read text. Most of what people hand them is not: PDFs, Word files, slide decks, spreadsheets, scans. A converter in front of the agent turns those into Markdown, which keeps headings, lists and tables in a form models handle well and that costs few tokens. [MarkItDown](entry:markitdown) (Microsoft) and [Docling](entry:docling) (started at IBM Research, now an LF AI & Data project) are the two open-source converters with MIT licenses and their own MCP servers.

What was run for this guide, on 2026-10-18, on a Linux box with 8 vCPUs and no GPU: MarkItDown 0.1.8 and Docling 2.140.0 on the 9-page [Docling Technical Report](https://arxiv.org/abs/2408.09869) PDF and on a small `.xlsx` and `.docx`; Docling's chunk export; and the [MCP Inspector](entry:mcp-inspector) CLI against markitdown-mcp 0.0.1a7 and docling-mcp 3.3.0. Timings below are from that one machine and one file, so treat them as a rough guide.

## Which one to use

| | MarkItDown | Docling |
|---|---|---|
| Approach | Format-specific libraries (pdfminer.six and pdfplumber for PDF, mammoth for Word, pandas and openpyxl for Excel), no ML models by default | Layout analysis, reading order, table-structure and OCR models; optional vision-language models |
| Formats (from each README) | PDF, PowerPoint, Word, Excel, images (EXIF and OCR), audio (transcription), HTML, CSV/JSON/XML, ZIP, YouTube URLs, EPub | PDF, DOCX/XLSX/PPTX, legacy Office and RTF (via LibreOffice), ODF, EPUB, Apple iWork, HTML, LaTeX, images, audio and video (with the `asr` extra), email, and more |
| Outputs | Markdown | Markdown, HTML, lossless JSON, DocTags, DocLang, plain text, WebVTT, LaTeX, and JSONL chunks |
| Install size in our test | 229 MB virtualenv with `[all]` | 1.5 GB virtualenv with CPU PyTorch, plus about 0.5 GB of models downloaded on first run |
| Our 9-page PDF | 2.2 s, plain text with no headings and a flattened table | 35 s, 22 headings and real Markdown tables |
| MCP server | `markitdown-mcp`: one tool, `convert_to_markdown(uri)` | `docling-mcp`: 21 tools for converting, editing and exporting documents |

In short: use MarkItDown for Office files, HTML and quick text out of born-digital PDFs. Use Docling when PDF layout matters, meaning multi-column pages, tables, scans, or chunks headed for a [vector database](comparison:vector-databases-for-agents). For web pages, a URL-to-Markdown service such as [Jina Reader](entry:jina-reader), [Firecrawl](entry:firecrawl-api) or [Crawl4AI](entry:crawl4ai) is the better fit; the [research agent stack](stack:research-agent) covers that side.

## 1. MarkItDown

Install it in a virtual environment. `[all]` pulls in every optional converter; you can also pick extras such as `[pdf, docx, pptx]`.

```bash
uv venv --python 3.12 .venv && source .venv/bin/activate
uv pip install 'markitdown[all]'
markitdown report.pdf -o report.md      # or: markitdown report.pdf > report.md
cat report.pdf | markitdown             # stdin works too
```

From Python:

```python
from markitdown import MarkItDown

md = MarkItDown(enable_plugins=False)
result = md.convert_local("pricing.xlsx")   # local files only; see Security below
print(result.markdown)
```

On Office files the output was clean. A one-sheet workbook came back as a heading per sheet plus a Markdown table:

```markdown
## Pricing
| Plan | Price per month (USD) | Seats |
| --- | --- | --- |
| Free | 0 | 1 |
| Team | 20 | 5 |
```

On the PDF it was fast (2.2 seconds) but shallow. The output had no Markdown headings. Words in justified lines often ran together ("state-of-the-artspecializedAImodels"), and the report's runtime table became loose lines of numbers. Pages that reproduce another paper's layout turned into wide pseudo-tables of letter fragments. That is what text-layer extraction gives you, and the README says as much: the output is meant for text-analysis tools, not high-fidelity conversion.

For better PDF and scan handling, MarkItDown can hand conversion to Azure Document Intelligence (`-d -e <endpoint>`) or Azure Content Understanding (`--use-cu`). Both are billable Azure API calls. The `markitdown-ocr` plugin adds OCR of embedded images through an LLM vision client you pass in. If you pass no client, the plugin loads but silently skips OCR.

## 2. Docling

```bash
uv venv --python 3.12 .venv-docling && source .venv-docling/bin/activate
uv pip install docling      # on CPU-only Linux, add the PyTorch CPU index to skip CUDA wheels:
# uv pip install docling --extra-index-url https://download.pytorch.org/whl/cpu --index-strategy unsafe-best-match
docling report.pdf --image-export-mode placeholder --output out/
```

Two defaults to know about:

- **Images.** With the CLI defaults, our Markdown file was 581 KB, because the figures were embedded as base64 data URIs. `--image-export-mode placeholder` replaces each one with `<!-- image -->` and brought the file down to 34 KB. Use `referenced` to write PNG files and link to them instead.
- **First run.** The first conversion downloads the layout and table models to the Hugging Face cache and the RapidOCR models into the package. That run took 60 seconds; later runs of the same file took about 35 seconds wall time, of which Docling reported 29 seconds converting.

The output had real structure: `## 1 Introduction`-style headings, proper paragraphs, and Table 1 as a Markdown table whose column headers are joined from the original's two header rows (`native backend - TTS`, `pypdfium backend - Mem`). Rows that share cells in the original were merged into one Markdown row, so check complex tables before you trust a number in them.

OCR is on by default. `--no-ocr` cut the run to 8 seconds of conversion, but the Markdown was 33 lines shorter: it lost part of the reproduced DocLayNet paper pages at the end of the report, including that paper's Table 2. Only switch OCR off after you've compared the output on your own documents.

From Python:

```python
from docling.document_converter import DocumentConverter

result = DocumentConverter().convert("report.pdf")   # a local path or a URL
print(result.document.export_to_markdown())
```

Docling also has a VLM pipeline (`docling --pipeline vlm --vlm-model granite_docling <file>`) and integrations with [LlamaIndex](entry:llamaindex), [Haystack](entry:haystack), LangChain and [CrewAI](entry:crewai). To run it as a service, [docling-serve](https://github.com/docling-project/docling-serve) provides an HTTP API on port 5001 (`pip install docling-serve` then `docling-serve run`, or the `docling-serve-cpu` container image, listed at 4.4 GB).

## 3. Chunks for retrieval

If the text is going into a vector store, chunk it with Docling rather than splitting the Markdown yourself. Its chunkers work on the document structure, so each chunk carries its headings, captions and page numbers:

```bash
docling report.pdf --to chunks --output chunks/
```

That wrote one JSONL file with 48 chunks for our PDF. Each line has `text` (the chunk with its heading prepended, ready to embed), `raw_text`, `num_tokens`, `headings`, `captions`, `page_numbers` and the origin file. The default is the `HybridChunker`, which starts from the document hierarchy, splits chunks that are too long for the tokenizer and merges small neighbours that share headings. When a table spans chunks, it repeats the table header by default. Set `--chunks-tokenizer` (a Hugging Face model id) and `--chunks-max-tokens` to match your embedding model. The first chunking run downloaded the `sentence-transformers/all-MiniLM-L6-v2` tokenizer as the default.

Load those lines into any store from the [vector database comparison](comparison:vector-databases-for-agents), and keep `page_numbers` in the metadata so the agent can cite where an answer came from. [Give an agent long-term memory](guide:give-an-agent-long-term-memory) covers the memory side.

## 4. Give the converter to an agent over MCP

Both projects ship an MCP server, so an agent can convert files on demand instead of you running a pipeline first (background: [Connect an agent to a remote MCP server](guide:connect-an-agent-to-a-remote-mcp-server)).

### markitdown-mcp

```bash
uv pip install markitdown-mcp
markitdown-mcp                                      # stdio, the default
markitdown-mcp --http --host 127.0.0.1 --port 3001  # Streamable HTTP at /mcp, SSE at /sse
```

```json
{
  "mcpServers": {
    "markitdown": { "command": "markitdown-mcp" }
  }
}
```

It exposes one tool, `convert_to_markdown`, taking an `http:`, `https:`, `file:` or `data:` URI. Checked with the Inspector:

```bash
npx @modelcontextprotocol/inspector --cli markitdown-mcp \
  --method tools/call --tool-name convert_to_markdown --tool-arg uri=file:///path/to/pricing.xlsx
```

It returned the same table as the CLI. The README recommends its Docker image for Claude Desktop, mounting only the directory you want converted (`-v /home/user/data:/workdir`).

### docling-mcp

The client snippet in Docling's docs is `uvx --from=docling-mcp docling-mcp-server`. With docling-mcp 3.3.0 that is not enough, for two reasons we hit:

1. **Conversion mode defaults to `remote`.** Without `DOCLING_MCP_SERVICE_URL`, every conversion failed with "DOCLING_MCP_SERVICE_URL is not set but DOCLING_MCP_CONVERSION_MODE=remote". To convert on your own machine, install the `local` extra and set the mode.
2. **Transport defaults to `streamable-http`** on `localhost:8000`. A client that launches the command and expects stdio needs `--transport stdio`.

This configuration converted our PDF (the first call took about 40 seconds, including server start-up):

```json
{
  "mcpServers": {
    "docling": {
      "command": "uvx",
      "args": ["--from", "docling-mcp[local]", "docling-mcp-server", "--transport", "stdio"],
      "env": { "DOCLING_MCP_CONVERSION_MODE": "local" }
    }
  }
}
```

The server keeps converted documents in an in-memory cache. `convert_document_into_docling_document` returns a `document_key`, and the agent then calls `export_docling_document_to_markdown` (with an optional `max_size` in characters) or the anchor tools (`get_overview_of_document_anchors`, `search_for_text_in_document_anchors`, `get_text_of_document_item_at_anchor`) to read parts of a long document instead of all of it. The other tools create and edit documents. Load fewer tool groups with the positional argument (`conversion`, `generation`, `manipulation`, plus optional RAG groups for LlamaIndex and Llama Stack). For a shared deployment, run docling-serve once and point each docling-mcp at it in remote mode with `DOCLING_MCP_SERVICE_URL` and `DOCLING_MCP_SERVICE_API_KEY`.

## 5. Security

Both converters read whatever their process can read.

- MarkItDown's README warns that `convert()` accepts local paths, remote URIs and streams, so untrusted input can make it read local files or fetch internal URLs. It recommends validating input, blocking private, loopback, link-local and metadata-service addresses, and calling the narrowest method you need (`convert_local()`, `convert_response()` or `convert_stream()`).
- markitdown-mcp has no authentication and binds to localhost in HTTP mode. Its README says the tool can read any file the server's user can access. In our test, `convert_to_markdown` with `file:///etc/hostname` returned the file. Run it in a container or VM with only the documents mounted, and do not bind it to other interfaces.
- docling-mcp takes local file paths and URLs too, so the same advice applies.
- Converted text is untrusted input. A PDF can carry instructions aimed at the agent that reads it. Keep converted content separate from instructions, and keep risky tools behind approval. [Run untrusted code in a sandbox](guide:run-untrusted-code-in-a-sandbox) covers isolation.

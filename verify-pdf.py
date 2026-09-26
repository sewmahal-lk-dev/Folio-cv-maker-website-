"""Inspect real browser PDFs, including their page geometry and visible content."""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent / "node_modules/pdf-test-tools"))
import pymupdf

for filename in sys.argv[1:]:
    with pymupdf.open(filename) as document:
        long_cv = filename.endswith("-long.pdf")
        assert len(document) >= 2 if long_cv else len(document) == 1, (filename, len(document))
        texts = []
        for page in document:
            assert abs(page.rect.width - 595.28) < 1, (filename, page.rect)
            assert abs(page.rect.height - 841.89) < 1, (filename, page.rect)
            text = page.get_text()
            assert text.strip(), (filename, "Blank PDF page")
            assert "file:///" not in text and "CV STUDIO" not in text, (filename, "Browser or website chrome printed")
            texts.append(text)
        combined = " ".join(texts)
        assert "Campus Connect" in combined, (filename, "Missing project")
        if long_cv:
            for index in range(1, 15):
                assert f"Experience marker {index}" in combined, (filename, index)
            assert "Final content marker" in combined, (filename, "Truncated final content")
        else:
            spans = [span for block in document[0].get_text("dict")["blocks"] if "lines" in block for line in block["lines"] for span in line["spans"]]
            body = [span for span in spans if span["text"].startswith("Developed")]
            assert body and body[0]["size"] >= 10, (filename, "Body text printed too small", body)
        if filename.endswith("timeline-1440.pdf") or filename.endswith("signature-1440.pdf"):
            document[0].get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), alpha=False).save(filename.replace("cv-a4-", "studio-a4-").replace(".pdf", ".png"))
        if filename.endswith("-390.pdf"):
            with pymupdf.open(filename.replace("-390.pdf", "-1440.pdf")) as desktop:
                assert document[0].get_pixmap().samples == desktop[0].get_pixmap().samples, (filename, "Mobile and desktop exports differ")
        print(f"PASS: {filename}: {len(document)} A4 page(s), complete text, no browser headers.")

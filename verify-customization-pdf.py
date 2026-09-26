import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent / "node_modules/pdf-test-tools"))
import pymupdf

for filename in json.load(sys.stdin):
    with pymupdf.open(filename) as document:
        text = " ".join(page.get_text() for page in document)
        for value in ["PrivateTitle", "private@example.com", "PrivatePhone", "PrivateSummary", "PrivateJob", "PrivateEmployer", "PrivateDescription", "PrivateEducation", "PrivateCertificate", "PrivateAchievement", "PrivateReference", "PrivateHeading", "PrivateCustom"]:
            assert value not in text, (filename, value)
        for value in ["PublicJob", "PublicEmployer", "PublicDescription", "PublicProject", "PublicInterest"]:
            assert value in text, (filename, value)
        for page in document:
            assert abs(page.rect.width - 595.28) < 1 and abs(page.rect.height - 841.89) < 1, (filename, page.rect)
            assert not page.get_images(), (filename, "Hidden portrait exported")
        print(f"PASS: {filename}: A4 export excludes hidden fields, sections, jobs, and photo.")

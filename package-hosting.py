"""Package only the static website and runtime assets for manual hosting."""
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parent
destination = root / 'hosting' / 'folio-cv-site'
destination.mkdir(parents=True, exist_ok=True)
files = [p for p in root.iterdir() if p.is_file() and p.suffix in {'.html', '.css', '.js'}]
files += [p for p in (root / 'assets').rglob('*') if p.is_file() and p.name != 'sample-portrait.png']
archive = root / 'hosting' / 'folio-cv-site.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
    for source in sorted(files):
        relative = source.relative_to(root)
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(source.read_bytes())
        bundle.write(source, relative)
print(f'Packaged {len(files)} website files: {archive} ({archive.stat().st_size / 1024 / 1024:.1f} MB)')

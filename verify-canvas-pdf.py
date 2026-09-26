import sys
from pathlib import Path
sys.path.insert(0,'node_modules/pdf-test-tools')
import pymupdf
cases={'cv-canvas-small-two.pdf':2,'cv-canvas-large-two.pdf':2,'cv-canvas-mixed.pdf':2,'cv-canvas-edited.pdf':1}
for name,count in cases.items():
 doc=pymupdf.open(name)
 assert len(doc)==count,(name,len(doc))
 for page in doc:
  assert abs(page.rect.width-595.28)<1 and abs(page.rect.height-841.89)<1
 text=''.join(page.get_text() for page in doc)
 assert 'Export PDF' not in text and 'Select a section' not in text
 if 'large' in name:
  for i in range(7):assert 'Position '+str(i) in text
 if 'mixed' in name:
  for i in range(4):
   assert 'Degree '+str(i) in text
   assert 'Project '+str(i) in text
  for i in range(30):assert 'Skill '+str(i) in text
 if 'edited' in name:
  assert 'Updated Person'.upper() in text.upper()
  assert any(page.get_images() for page in doc)
 print('PASS',name,len(doc),'A4 pages; content and print isolation verified')

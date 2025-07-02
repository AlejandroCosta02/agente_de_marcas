from flask import Flask, request, jsonify
import pdfplumber
import io
import base64
from PIL import Image
import fitz  # PyMuPDF for better image extraction

app = Flask(__name__)

@app.route('/extract-text', methods=['POST'])
def extract_text():
    file = request.files['file']
    pdf_bytes = file.read()
    text_by_page = []
    images_by_page = []
    
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for i, page in enumerate(pdf.pages):
            if i < 2:
                continue  # skip first two pages
            text_by_page.append(page.extract_text() or "")
    
    # Extract images using PyMuPDF for better image handling
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    for i in range(2, len(doc)):  # Skip first two pages
        page = doc[i]
        images = page.get_images()
        page_images = []
        for img_index, img in enumerate(images):
            try:
                xref = img[0]
                pix = fitz.Pixmap(doc, xref)
                if pix.n - pix.alpha < 4:  # GRAY or RGB
                    img_data = pix.tobytes("png")
                    img_base64 = base64.b64encode(img_data).decode('utf-8')
                    page_images.append({
                        'index': img_index,
                        'data': img_base64,
                        'format': 'png'
                    })
                pix = None
            except Exception as e:
                print(f"Error extracting image {img_index} from page {i}: {e}")
        images_by_page.append(page_images)
    doc.close()
    
    return jsonify({
        "pages": text_by_page,
        "images": images_by_page
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001) 
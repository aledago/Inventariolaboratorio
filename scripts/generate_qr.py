import qrcode
import os
import json

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas

# URL di base (modifica con il tuo dominio reale o IP locale per test)
# Esempio: "https://inventario-lab-rainerum.web.app" o "http://192.168.1.X:5000"
BASE_URL = "https://inventario-lab-rainerum.web.app"

# Configurazione Armadi (Copiata/Adattata da config_lab.js)
CONFIGURAZIONE = {
    "armadi": [
        { "id": "A", "ripiani": 4 },
        { "id": "B", "ripiani": 5 },
        { "id": "C", "ripiani": 5 },
        { "id": "D", "ripiani": 9 },
        { "id": "F", "ripiani": 4 },
        { "id": "G", "ripiani": 4 },
        { "id": "H", "ripiani": 7 },
        { "id": "I", "ripiani": 4 },
        { "id": "J", "ripiani": 4 },
        { "id": "K", "ripiani": 7 },
        { "id": "L", "ripiani": 4 },
        { "id": "M", "ripiani": 4 },
        { "id": "N", "ripiani": 0 },
    ]
}

OUTPUT_DIR = "qr_codes"

def generate_codes():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Directory '{OUTPUT_DIR}' creata.")

    print(f"Generazione codici QR in '{OUTPUT_DIR}'...")

    qr_items = []
    for arm in CONFIGURAZIONE["armadi"]:
        arm_id = arm["id"]

        # Costruisci l'URL per l'armadio
        # La pagina armadio.html legge il parametro ?id=
        url = f"{BASE_URL}/armadio.html?id={arm_id}"
        
        # Crea QR
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        
        # Salva
        filename = f"QR_Armadio_{arm_id}.png"
        path = os.path.join(OUTPUT_DIR, filename)
        img.save(path)
        print(f"Generato: {filename} -> {url}")
        qr_items.append({
            "path": path,
            "label": f"Armadio {arm_id}",
            "url": url,
            "id": arm_id
        })

    pdf_path = os.path.join(OUTPUT_DIR, "QR_Armadi_A4.pdf")
    generate_pdf(qr_items, pdf_path)
    print(f"PDF generato: {pdf_path}")
    print("Completato.")


def generate_pdf(qr_items, output_pdf):
    page_width, page_height = A4
    margin = 2 * cm
    qr_size = 5 * cm
    label_height = 0.8 * cm
    row_height = qr_size + label_height + 0.7 * cm
    col_width = qr_size + 1 * cm

    columns = int((page_width - 2 * margin + 1 * cm) // col_width)
    if columns < 1:
        columns = 1

    c = canvas.Canvas(output_pdf, pagesize=A4)
    x = margin
    y = page_height - margin - qr_size
    bottom_limit = margin + label_height + 0.3 * cm

    for index, item in enumerate(qr_items):
        if x + qr_size > page_width - margin + 1e-6:
            x = margin
            y -= row_height

        if y < bottom_limit:
            c.showPage()
            x = margin
            y = page_height - margin - qr_size

        c.drawImage(item["path"], x, y, width=qr_size, height=qr_size, preserveAspectRatio=True, anchor='c')
        c.setFont("Helvetica", 10)
        c.drawCentredString(x + qr_size / 2, y - 0.3 * cm, item["label"])

        x += col_width

    c.save()

if __name__ == "__main__":
    generate_codes()

import qrcode
import os
import json

# URL di base (modifica con il tuo dominio reale o IP locale per test)
# Esempio: "https://inventario-lab-rainerum.web.app" o "http://192.168.1.X:5000"
BASE_URL = "https://inventario-lab-rainerum.web.app"

# Configurazione Armadi (Copiata/Adattata da config_lab.js)
CONFIGURAZIONE = {
    "armadi": [
        { "id": "A", "ripiani": 4 },
        { "id": "B", "ripiani": 5 },
        { "id": "C", "ripiani": 4 },
        { "id": "D", "ripiani": 4 },
        { "id": "F", "ripiani": 4 },
        { "id": "G", "ripiani": 4 },
        { "id": "H", "ripiani": 4 },
        { "id": "I", "ripiani": 4 },
        { "id": "J", "ripiani": 4 },
        { "id": "K", "ripiani": 4 },
        { "id": "L", "ripiani": 4 },
        { "id": "M", "ripiani": 4 },
        { "id": "N", "ripiani": 1 }, # Cattedra (adattato)
    ]
}

OUTPUT_DIR = "qr_codes"

def generate_codes():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Directory '{OUTPUT_DIR}' creata.")

    print(f"Generazione codici QR in '{OUTPUT_DIR}'...")

    for arm in CONFIGURAZIONE["armadi"]:
        arm_id = arm["id"]
        ripiani = arm.get("ripiani", 0)

        for r in range(1, ripiani + 1):
            # Costruisci l'URL
            url = f"{BASE_URL}/ripiano.html?armadio={arm_id}&ripiano={r}"
            
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
            filename = f"QR_Armadio_{arm_id}_Ripiano_{r}.png"
            path = os.path.join(OUTPUT_DIR, filename)
            img.save(path)
            print(f"Generato: {filename} -> {url}")

    print("Completato.")

if __name__ == "__main__":
    generate_codes()

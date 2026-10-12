"""
Extrae de tu archivo ORIGINAL (el de un solo bloque):
  - la imagen de Woodstock (base64) -> img/woodstock.png
  - el SVG de los tulipanes          -> js/tulipanes.js

Uso, desde la carpeta del proyecto:
    python extraer_assets.py html.html
(Dani.html = el archivo original grande)
"""
import re, sys, base64, json, os

src = sys.argv[1] if len(sys.argv) > 1 else "hola.html"
html = open(src, encoding="utf-8", errors="replace").read()
print(f"Leído {src}: {len(html):,} caracteres")

# 1) Woodstock: cualquier data URI de imagen base64
m = re.search(r'src\s*=\s*["\']data:image/(png|jpe?g|webp|gif);base64,([^"\']+)["\']', html, re.S)
if not m:
    print("ERROR: no encontré la imagen base64. ¿Es este el archivo ORIGINAL grande?")
else:
    ext = "png" if m.group(1) == "png" else m.group(1).replace("jpeg", "jpg")
    b64 = re.sub(r"\s+", "", m.group(2))
    b64 += "=" * (-len(b64) % 4)
    data = base64.b64decode(b64)
    os.makedirs("img", exist_ok=True)
    out = f"img/woodstock.{ext}"
    open(out, "wb").write(data)
    print(f"OK  {out} ({len(data):,} bytes)")
    if ext != "png":
        print(f"AVISO: la imagen es {ext}; cambia img/woodstock.png por {out} en hola.html")
    if len(data) < 1000:
        print("AVISO: la imagen es muy pequeña, puede estar dañada.")

# 2) SVG de tulipanes (busca el svg que contiene tulipFlower, sin depender del div)
i = html.find('id="tulipFlower"')
start = html.rfind("<svg", 0, i) if i != -1 else -1
end = html.find("</svg>", i) + len("</svg>") if i != -1 else -1
if start == -1 or end < start:
    print("ERROR: no encontré el SVG de los tulipanes en este archivo.")
else:
    svg = html[start:end]
    os.makedirs("js", exist_ok=True)
    with open("js/tulipanes.js", "w", encoding="utf-8") as f:
        f.write("document.getElementById('tulipBand').innerHTML = " + json.dumps(svg) + ";\n")
    print(f"OK  js/tulipanes.js ({len(svg):,} caracteres de SVG)")
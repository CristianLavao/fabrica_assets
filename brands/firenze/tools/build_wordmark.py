"""Extrae el nombre FIRENZE (letras trazadas) del logo horizontal oficial.

Sale un SVG solo con las letras, sin sello, filete ni "S.A.S.", en las cinco
tintas del manual: ds/project/assets/Logos/firenze-nombre-<tinta>.svg
Las letras no se redibujan: se copian los trazados tal cual del archivo entregado.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "logos" / "logo-horizontal.svg"
OUT = ROOT / "ds" / "project" / "assets" / "Logos"

INKS = {
    "verde": "#0f583d",
    "blanco": "#ffffff",
    "tea": "#ddedaa",
    "lapis": "#226188",
    "oxford": "#0d152e",
}

TOKEN = re.compile(r"[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?")
ARGS = {"M": 2, "L": 2, "H": 1, "V": 1, "C": 6, "S": 4, "Q": 4, "T": 2, "A": 7, "Z": 0}


def path_points(d: str):
    """Puntos finales y de control de un trazado (cota superior del bbox)."""
    toks = TOKEN.findall(d)
    x = y = sx = sy = 0.0
    cmd = None
    i = 0
    pts = []
    while i < len(toks):
        if toks[i].isalpha():
            cmd = toks[i]
            i += 1
            if cmd in "Zz":
                x, y = sx, sy
                continue
        up = cmd.upper()
        n = ARGS[up]
        vals = [float(v) for v in toks[i:i + n]]
        i += n
        rel = cmd.islower()
        if up == "H":
            x = vals[0] + (x if rel else 0)
        elif up == "V":
            y = vals[0] + (y if rel else 0)
        elif up == "A":
            x = vals[5] + (x if rel else 0)
            y = vals[6] + (y if rel else 0)
        else:
            bx, by = (x, y) if rel else (0, 0)
            for k in range(0, n, 2):
                pts.append((vals[k] + bx, vals[k + 1] + by))
            x, y = vals[-2] + bx, vals[-1] + by
        pts.append((x, y))
        if up == "M":
            sx, sy = x, y
            cmd = "l" if rel else "L"
    return pts


def main() -> None:
    svg = SRC.read_text(encoding="utf-8")
    paths = re.findall(r'<path class="cls-1" d="([^"]+)"/>', svg)
    letters = []
    for d in paths:
        pts = path_points(d)
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        # Letras: a la derecha del sello (x > 190) y por encima del filete (y < 135)
        if min(xs) > 190 and max(ys) < 135:
            letters.append((d, min(xs), min(ys), max(xs), max(ys)))
    x0 = min(l[1] for l in letters)
    y0 = min(l[2] for l in letters)
    x1 = max(l[3] for l in letters)
    y1 = max(l[4] for l in letters)
    w, h = x1 - x0, y1 - y0
    body = "".join(f'<path d="{l[0]}"/>' for l in letters)
    OUT.mkdir(parents=True, exist_ok=True)
    for name, ink in INKS.items():
        out = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.2f} {y0:.2f} {w:.2f} {h:.2f}" '
            f'role="img" aria-label="FIRENZE"><g fill="{ink}">{body}</g></svg>'
        )
        (OUT / f"firenze-nombre-{name}.svg").write_text(out, encoding="utf-8")
    print(f"{len(letters)} letras, viewBox {x0:.2f} {y0:.2f} {w:.2f} {h:.2f}, proporción {w / h:.3f}")


if __name__ == "__main__":
    main()

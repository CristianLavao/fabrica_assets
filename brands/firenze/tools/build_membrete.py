"""Logo de la hoja membreteada (manual, pág. 12): sello en castleton-green, nombre, filete y
"S.A.S." en oxford-blue, y el NIT bajo el filete. Se construye desde el logo horizontal oficial
(no se redibuja nada) y sale en ds/project/assets/Logos/firenze-membrete-color.svg.
"""
import pathlib
import re

from build_wordmark import path_points

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "logos" / "logo-horizontal.svg"
OUT = ROOT / "ds" / "project" / "assets" / "Logos" / "firenze-membrete-color.svg"
VERDE, OXFORD = "#0f583d", "#0d152e"
NIT = "NIT 901.907.766-5"


def main() -> None:
    svg = SRC.read_text(encoding="utf-8")

    def recolor(m):
        d = m.group(1)
        xs = [p[0] for p in path_points(d)]
        # El sello ocupa x < 175; letras y filete quedan a la derecha
        color = OXFORD if min(xs) > 175 else VERDE
        return f'<path fill="{color}" d="{d}"/>'

    svg = re.sub(r'<path class="cls-1" d="([^"]+)"/>', recolor, svg)
    svg = svg.replace(".cls-1,.cls-2{fill:#10583d;}", ".cls-2{fill:" + OXFORD + ";}")
    # Más alto para el NIT, alineado al inicio del filete
    svg = svg.replace('viewBox="0 0 693.16 168.55"', 'viewBox="0 0 693.16 182"')
    nit = (f'<text x="197" y="176" font-family="Codec Pro, sans-serif" font-size="19" '
           f'letter-spacing="0.5" fill="{OXFORD}">{NIT}</text>')
    svg = svg.replace("</g></g></svg>", nit + "</g></g></svg>")
    OUT.write_text(svg, encoding="utf-8")
    print("ok", OUT.name, len(svg))


if __name__ == "__main__":
    main()

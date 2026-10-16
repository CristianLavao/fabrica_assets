"""Genera las variantes de logo e iconos de FIRENZE a partir de los SVG originales.

- Incrusta Simplo Medium en los SVG que tienen texto vivo ("S.A.S."), para que
  se vean bien dentro de <img> y en exportaciones sin la fuente instalada.
- Crea las versiones de color aprobadas en el manual (Artboard 19).
Salida: ds/project/assets/Logos y ds/project/assets/Icons
"""
import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC_LOGOS = ROOT / "logos"
SRC_ICONS = ROOT / "icons"
OUT = ROOT / "ds" / "project" / "assets"

FONT_B64 = base64.b64encode((ROOT / "fonts" / "Simplo-Medium.woff2").read_bytes()).decode()
FONT_FACE = (
    "@font-face{font-family:Simplo-Medium;font-weight:500;"
    f"src:url(data:font/woff2;base64,{FONT_B64}) format('woff2');}}"
)

# Versiones de color del manual: nombre -> (color del logo)
LOGO_INKS = {
    "verde": "#0f583d",   # Castleton Green sobre claro
    "blanco": "#ffffff",  # sobre Castleton Green
    "tea": "#ddedaa",     # sobre Oxford Blue
    "lapis": "#226188",   # sobre Oxford Blue
    "oxford": "#0d152e",  # sobre Tea Green
}
ICON_INKS = {"oxford": "#0d152e", "blanco": "#ffffff", "verde": "#0f583d"}

ORIGINAL_FILLS = re.compile(r"fill:#(10583d|11593e|010101|231f20)", re.I)


def recolor(svg: str, ink: str) -> str:
    return ORIGINAL_FILLS.sub(f"fill:{ink}", svg)


def embed_font(svg: str) -> str:
    if "font-family" not in svg:
        return svg
    return svg.replace("<style>", "<style>" + FONT_FACE, 1)


def main() -> None:
    logos_out = OUT / "Logos"
    icons_out = OUT / "Icons"
    logos_out.mkdir(parents=True, exist_ok=True)
    icons_out.mkdir(parents=True, exist_ok=True)

    for src, base in [
        ("logo-horizontal.svg", "firenze-horizontal"),
        ("logo-vertical.svg", "firenze-vertical"),
        ("isotipo.svg", "firenze-isotipo"),
    ]:
        svg = (SRC_LOGOS / src).read_text(encoding="utf-8")
        for name, ink in LOGO_INKS.items():
            (logos_out / f"{base}-{name}.svg").write_text(embed_font(recolor(svg, ink)), encoding="utf-8")

    # El vertical original lleva el nombre en negro: se conserva tal cual.
    original = (SRC_LOGOS / "logo-vertical.svg").read_text(encoding="utf-8")
    (logos_out / "firenze-vertical-original.svg").write_text(embed_font(original), encoding="utf-8")

    hoja = (SRC_LOGOS / "parte-logo.svg").read_text(encoding="utf-8")
    for name, ink in LOGO_INKS.items():
        (logos_out / f"firenze-hoja-{name}.svg").write_text(recolor(hoja, ink), encoding="utf-8")

    for src in ["mail", "phone", "instagram"]:
        svg = (SRC_ICONS / f"{src}.svg").read_text(encoding="utf-8")
        for name, ink in ICON_INKS.items():
            out = recolor(svg, ink)
            # Versión blanca: la figura pasa a blanco y el detalle interior (antes blanco) toma
            # el verde de marca, que es el fondo habitual de estas franjas de contacto.
            if name == "blanco":
                out = out.replace("fill:#fff;", "fill:#0f583d;")
            (icons_out / f"{src}-{name}.svg").write_text(out, encoding="utf-8")


if __name__ == "__main__":
    main()

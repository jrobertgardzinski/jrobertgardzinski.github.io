# Brand — jRobertGardzinski

Pliki logo do druku (koszulki, naklejki, vlepki). Wygenerowane z prawdziwym
**JetBrains Mono Bold** — font na licencji SIL OFL 1.1, więc merch jest legalny
bez żadnych opłat.

| Plik | Przeznaczenie |
|---|---|
| `wordmark-dark.png` | pełne logo na **ciemne** podłoże (przezroczyste tło, ~4300 px szerokości) |
| `wordmark-light.png` | pełne logo na **jasne** podłoże |
| `monogram-dark.png` | kafelek `jRG`, wariant ciemny (1024×1024) |
| `monogram-light.png` | kafelek `jRG`, wariant jasny (1024×1024) |

## Kolory

| | j | R / Robert | G / Gardzinski | kafelek | ramka |
|---|---|---|---|---|---|
| **Darcula** | `#FFFFFF` | `#FFC0C0` | `#C0FFC0` | `#3C3F41` | `#4E5254` |
| **Light** | `#000000` | `#800000` | `#008000` | `#FFFFFF` | `#D4D7DC` |

Symetria R/G: kanał barwy `FF`, reszta `C0` (Darcula) ↔ kanał barwy `80`, reszta `00` (Light).

## Dla drukarni

- PNG przy 300 DPI wystarczą do nadruku ~35 cm szerokości (wordmark) / ~8 cm (monogram).
- Gdyby potrzebny był wektor: font to [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
  (waga Bold), tekst `jRobertGardzinski`, kolory jak wyżej — każdy studio odtworzy w 5 minut.

## Regeneracja

```
node tools/brand-gen.mjs
```

(generuje też favicony strony — jeden skrypt, jedna prawda o logo).

# jRobertGardzinski — blog programisty Java

Statyczny blog (Astro) w klimacie IntelliJ (Darcula / Light), hostowany na GitHub Pages.
Handoff projektowy i prototypy HTML leżą w [`design/`](design/README.md) — to referencja wyglądu, nie kod produkcyjny.

## Komendy

| Komenda | Co robi |
|---|---|
| `npm run dev` | serwer deweloperski (http://localhost:4321) |
| `npm run build` | buduje stronę do `dist/` |
| `npm run preview` | podgląd zbudowanej strony |
| `npm test` | build treści testowej + pełna suita BDD (Cucumber + Playwright na Chromium) |
| `npm run build:fixtures` | buduje stronę z treścią testową (`tests/fixtures/posts`) do `dist-test/` |
| `npm run test:bdd` | sama suita BDD (wymaga wcześniejszego `build:fixtures`) |

## Narzędzia — ściąga dla początkującego

Cały stack stoi na Node.js zamiast JVM — analogie do świata Javy w nawiasach:

- **Node.js** — środowisko uruchomieniowe JavaScriptu poza przeglądarką (odpowiednik JVM). Potrzebne tylko lokalnie i na CI — na hosting trafia czysty HTML/CSS/JS.
- **npm** — menedżer zależności i skryptów (Maven/Gradle): `package.json` ≈ `pom.xml`, `node_modules/` ≈ lokalne repozytorium zależności, `npm run <skrypt>` ≈ `mvn <goal>`. `package-lock.json` przypina wersje — commituj go.
- **Astro** — generator statyczny: bierze wpisy Markdown + szablony `.astro` (HTML z odrobiną kodu na górze pliku) i przy buildzie wypluwa gotowe strony do `dist/`. W przeglądarce nie działa żaden framework — tylko dwa małe skrypty vanilla JS (motyw/język + filtry). „Content collections" = typowany schemat frontmattera (`src/content.config.ts`), działa jak Bean Validation: zły `section` wywali build z czytelnym błędem.
- **Shiki** — kolorowanie składni bloków kodu w czasie builda (nie w przeglądarce). Motywy Darcula/IntelliJ Light zdefiniowane w `plugins/shiki-themes.mjs`.
- **Gherkin** — język scenariuszy `Given/When/Then` w plikach `features/*.feature`. Sama specyfikacja, zero kodu.
- **Cucumber.js** — silnik BDD (brat Cucumber-JVM): czyta `.feature` i dopasowuje kroki do funkcji w `features/step_definitions/steps.js`.
- **Playwright** — automatyzacja przeglądarki (nowoczesny odpowiednik Selenium). Kroki Cucumbera sterują przez niego prawdziwym Chromium, uruchomionym na zbudowanej stronie serwowanej tak jak na produkcji.
- **GitHub Actions** — CI/CD wbudowane w GitHuba (odpowiednik Jenkinsa). Workflow `.github/workflows/deploy.yml`: po każdym pushu do `main` build + publikacja.
- **GitHub Pages** — darmowy hosting plików statycznych prosto z repo. Zero serwera do utrzymania.
- **Sveltia CMS** — panel do pisania wpisów pod `/admin`: statyczna aplikacja, która edytuje pliki `.md` w repo przez API GitHuba (każdy zapis = commit). Żadnej bazy danych.
- **Disqus** — zewnętrzny system komentarzy osadzany skryptem na stronie wpisu (shortname w `src/config.ts`).
- **GoatCounter** — lekka analityka ruchu bez cookies (kod w `src/config.ts`); dashboard na `<kod>.goatcounter.com`.

## Pisanie wpisów

Jeden wpis = jeden plik Markdown w `src/content/posts/` o nazwie `{slug}.{pl|en}.md`.
**Język bierze się z nazwy pliku** (`.pl.md` / `.en.md`) — nie ma go we frontmatterze.
Wpis dwujęzyczny to **dwa pliki o wspólnym slugu** (`hello-world.pl.md` + `hello-world.en.md`) —
na liście pojawia się raz z badge `PL/EN`, a przełącznik PL|EN na stronie wpisu podmienia wersję.

```yaml
---
title: "Hello World"
date: 2026-07-17
section: it       # it | f1 | diy | cooking
project: blog     # opcjonalnie
tags: [hello-world, claude]
excerpt: "Zajawka na listę wpisów."   # opcjonalnie — inaczej z początku treści
readingTime: 3    # opcjonalnie — inaczej liczone przy buildzie
draft: false
canonicalUrl: ""  # opcjonalnie — TYLKO gdy oryginał wpisu żyje gdzie indziej (syndykacja)
---
```

Blok kodu z paskiem nazwy pliku:

````markdown
```java title="HelloWorld.java"
void main() { IO.println("Hello, World!"); }
```
````

Edycja online: Sveltia CMS pod `/admin` (konfiguracja w `public/admin/config.yml` —
**TODO: wpisz właściwe repo** w polu `backend.repo`). Fallback: edycja `.md` przez github.dev.

### Wersje robocze i publikacja

- `draft: true` we frontmatterze = **szkic**: plik może leżeć w repo (nawet na `main`),
  ale nie jest publikowany — nie ma go na liście, nie ma strony, nie ma go w RSS.
- `npm run dev` **pokazuje szkice** z plakietką „szkic" — lokalny podgląd przed publikacją.
- **Publikacja** = zmiana na `draft: false` (edycja jednej linii przez github.dev albo
  odznaczenie „Szkic" w CMS) i push — deploy leci automatycznie.
- Przykładowy szkic czeka w `src/content/posts/hexagon-w-springu.pl.md`.

### Filtry w URL-u (deep-linki)

Stan filtrów listy żyje w parametrach adresu: `?section=it&project=hexagon-demo&tags=spring,ddd&q=fraza&page=2`.
Dzięki temu: powrót z wpisu (wstecz albo „← wpisy") przywraca poprzednie filtry, wejście
przez „wpisy" w menu daje czystą listę, a przefiltrowany widok można podesłać linkiem.
Przycisk „× wyczyść" przy wyszukiwarce pojawia się tylko przy aktywnych filtrach.

### Cross-posting (dev.to i inne platformy)

Każda strona bloga deklaruje `rel=canonical` wskazujący samą siebie — blog jest „oryginałem".
Dzięki temu możesz bezkarnie publikować kopie wpisów na platformach zasięgowych:

- **dev.to**: Settings → Extensions → „Publishing to DEV from RSS" → podaj `https://jrobertgardzinski.pl/rss.xml`
  i zaznacz oznaczanie źródła jako canonical. Wpisy będą wpadać jako szkice do akceptacji.
- **Medium / Hashnode**: przy imporcie/publikacji ustaw „canonical/original URL" na adres wpisu na blogu.
- Kierunek odwrotny (kopia u Ciebie, oryginał gdzie indziej): ustaw `canonicalUrl` we frontmatterze —
  strona zadeklaruje tamten adres jako kanoniczny.
- Teksty pisane dla redakcji (np. Baeldung) żyją u wydawcy — na blogu publikuj zajawkę z linkiem.

### Daty aktualizacji i historia zmian

- **Data publikacji** = pole `date` we frontmatterze (przy publikacji szkicu ustaw na dzień publikacji).
- **Data modyfikacji** liczy się przy buildzie **automatycznie z gita**: pierwszy commit pliku to
  publikacja, a „zaktualizowano {data ostatniego commita}" pojawia się w meta wpisu dopiero, gdy plik
  ma kolejne commity. Uwaga: każda zmiana pliku bumpuje datę — także poprawka literówki (świadoma
  decyzja: zero ręcznej roboty). Workflow deployu robi pełny checkout (`fetch-depth: 0`), bez tego
  daty by kłamały.
- **Historia zmian**: po ustawieniu `repoUrl` w `src/config.ts` każdy wpis dostaje link
  „historia zmian ↗" do widoku commitów swojego pliku na GitHubie (pełne diffy). Wymaga publicznego repo.

## BDD: zgłaszanie błędów scenariuszami

Suita mieszka w `features/` — **scenariusze piszemy po angielsku** (standardowy Gherkin),
kroki w `features/step_definitions/steps.js`, infrastruktura (serwer statyczny + Chromium)
w `features/support/`.

Testy działają na **treści testowej generowanej w locie**: `tests/build-fixtures.mjs` kopiuje
prawdziwe Hello World, dogenerowuje wpisy wypełniające (2 PL, 13 EN, jeden szkic) do
tymczasowego `tests/.generated-posts/`, buduje z nich stronę do `dist-test/` i sprząta po
sobie. W repo nie ma żadnych sztucznych artykułów, a suita nie psuje się, gdy na blogu
przybywa prawdziwych wpisów.

Znalazłeś błąd? Opisz go scenariuszem i dopisz do istniejącego `.feature` (albo załóż nowy plik):

```gherkin
Scenario: Tag filter does not reset pagination   # BUG-…
  Given I open the home page
  When I switch the language to "EN"
  And I go to page 2
  And I click the tag "fixture"
  Then page 1 is active
```

Scenariusz ma **oblać** na buggy kodzie — potem naprawiamy do zielonego. Dostępne kroki:

- `Given I open the home page` / `I open the about page` / `I open the post "slug" in language "en"`
- `When I search for "…"` / `I click the tag "…"` / `I click the section "…"` / `I click the project "…"`
- `When I toggle the theme` / `I switch the language to "EN"` / `I reload the page` / `I click the post "…"` / `I go to page 2` / `I fetch "/rss.xml"`
- `Then I see 3 posts in the list` / `I see only posts in "EN"` / `the result counter shows "…"` / `the featured post is "…"` / `the featured post label is "…"`
- `Then the pagination is hidden` / `the pagination is visible` / `page 1 is active`
- `Then the page theme is "dark"` / `the theme button label is "…"` / `the active language is "PL"`
- `Then I am on the post "…"` / `the post content contains "…"` / `the post language badge is "…"` / `the page address contains "…"`
- `Then I see the text "…"` / `the notice "…" is hidden` / `I see the card "…"` / `I see the code block header "…"` / `I see the section heading "…"`
- `Then the response status is 200` / `the response contains "…"` / `the response does not contain "…"` / `the footer link "rss" points to "/rss.xml"`

Brakuje kroku? Opisz scenariusz tak, jak chcesz — krok się dopisze.

## Deploy (GitHub Pages, bez VPS)

1. Utwórz repo na GitHubie i wypchnij `main` — workflow `.github/workflows/deploy.yml`
   buduje Astro i publikuje na Pages przy każdym pushu.
2. W repo: **Settings → Pages → Source: GitHub Actions** (jednorazowo).
3. Domena `jrobertgardzinski.pl` (plik `public/CNAME` już jest w repo) — po zakupie ustaw u rejestratora:
   - rekordy `A` dla `@` (apex): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`,
   - opcjonalnie `AAAA`: `2606:50c0:8000::153`, `…8001::153`, `…8002::153`, `…8003::153`,
   - `CNAME` dla `www` → `jrobertgardzinski.github.io`.
4. W repo **Settings → Pages** wpisz domenę `jrobertgardzinski.pl`, a po propagacji DNS włącz **Enforce HTTPS**.

## Analityka (GoatCounter + Search Console)

Ruch mierzy **GoatCounter** — darmowy do użytku niekomercyjnego, bez cookies i bez danych
osobowych, więc **bez banera RODO**. Dopóki kod nie jest skonfigurowany, strona nie ładuje
żadnego skryptu analityki (przybite testami w `features/analytics.feature`).

Konto założone: kod strony **`jrobertgardzinski`**, dashboard pod
`https://jrobertgardzinski.goatcounter.com`, kod wpisany w `src/config.ts`,
scenariusze w `features/analytics.feature` przepięte na pozytywne.

Zostało jedno ustawienie po stronie GoatCountera — w panelu, w **Settings**, zaznacz
**„allow using the visitor counter"**. Bez tego publiczny endpoint z licznikami zwraca
`403: Need to enable the 'allow using the visitor counter' setting`, więc licznik wyświetleń
na wpisach nie ma skąd wziąć liczby (sam skrypt analityki działa niezależnie od tej opcji).
Sprawdzenie z terminala:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://jrobertgardzinski.goatcounter.com/counter/TOTAL.json
# 403 = ustawienie wyłączone, 200 = działa
```

Statystyki lecą od pierwszego wejścia po deployu; lokalne wejścia z `localhost` nie są liczone,
więc na `npm run dev` licznik nie pojawi się nigdy.

**Licznik wizyt na wpisie** (`src/pages/wpisy/[lang]/[slug].astro`): liczba jest pobierana **w trakcie
builda** (`src/lib/views.ts`) i wpisana na stałe w HTML — dlatego widzą ją też czytelnicy z blokerem,
który nie wypuszcza z urządzenia żadnego żądania do `goatcounter.com`. Skrypt na stronie już tylko ją
odświeża i **nigdy jej nie obniża ani nie chowa**; pyta po kolei: najpierw first-party proxy
(`wizyty.jrobertgardzinski.pl`, `proxy/README.md` — near-real-time, niewidoczne dla list filtrów),
potem publiczny endpoint `https://<kod>.goatcounter.com/counter/<ścieżka>.json` (cache ~4 h,
blokowalny). Liczba jest odmieniana przez liczbę mnogą (`1 wizyta` / `3 wizyty` / `12 wizyt`,
po angielsku `visit`/`visits`).
Endpoint zwraca dwie liczby, **`count` i `count_unique`, i są one identyczne** — `count_unique` to alias
zostawiony dla wstecznej zgodności, o którym dokumentacja GoatCountera mówi wprost „should not be used
for new code", więc kod czyta `count`. To ta sama liczba, którą panel pokazuje jako „visits".
Żądanie z przeglądarki idzie z `cache: 'no-store'` — patrz punkt 1 niżej, bez tego licznik potrafi
zamarznąć na kilka godzin. Tego akurat **nie pokrywa suita BDD**: Playwright przechwytuje żądania
przed cache'em przeglądarki, więc stub przechodzi tak samo z poprawką i bez niej.
Element renderuje się dopiero po wpisaniu `goatcounterCode`, a każda awaria — wyłączony endpoint,
zablokowany request, strona bez jeszcze żadnej wizyty — po prostu zostawia licznik ukryty, więc belka
nigdy nie pokazuje zera ani błędu. Liczby narastają od dnia włączenia analityki, historii nie da się odtworzyć.

**Gdy licznik nic nie pokazuje** — to prawie zawsze jedna z trzech rzeczy, a konsola przeglądarki mówi
która (każde wyjście z tego skryptu loguje `[views] …`):

1. **Liczby są cache'owane w dwóch miejscach naraz — i dotyczy to także `404`.**
   **(a) Po stronie GoatCountera:** ich cache zapamiętuje odpowiedź przy PIERWSZYM pytaniu o daną
   ścieżkę i trzyma ją ok. 4 godzin. Jeśli ktoś (albo Twój własny `curl`) zapytał o adres, zanim
   GoatCounter zaksięgował pierwszą wizytę, to `404` jest zabetonowane na te kilka godzin — mimo że
   w panelu wizyta widnieje od razu. Zmierzone: `?_=cokolwiek` nie zmienia klucza cache'u, nagłówek
   `Cache-Control: no-cache` jest ignorowany, `age` rośnie dalej. Z przeglądarki NIE DA SIĘ tego obejść
   — trzeba przeczekać. Ścieżka nigdy wcześniej nieodpytana odpowiada z `age: 0`.
   **(b) Po stronie przeglądarki:** raz pobrane `404` ląduje w cache'u dyskowym i jest odgrywane przy
   każdym kolejnym wejściu, nawet po `F5` (w HAR-ze: `"_fromCache": "disk"` przy zerowym ruchu
   sieciowym). To akurat naprawia `cache: 'no-store'` w kodzie strony.
   ```bash
   curl -sD - https://jrobertgardzinski.goatcounter.com/counter/wpisy/pl/hello-world.json | head -20
   ```
   Jeśli diagnozujesz to w DevToolsach, **zaznacz „Disable cache"** albo patrz w kolumnę Size — inaczej
   zobaczysz odpowiedź sprzed godzin i uznasz, że blog nie czyta danych.
2. **Bloker reklam zabija żądanie.** `goatcounter.com` jest na standardowych listach filtrów (uBlock,
   Firefox ETP w trybie „ścisłym", Brave), więc **Ty** możesz nie widzieć licznika, choć czytelnicy widzą
   go normalnie. Sprawdzenie zajmuje sekundę: konsola pokaże `[views] żądanie … nie wyszło z przeglądarki`,
   a wejście w trybie prywatnym z wyłączonym blokerem pokaże liczbę.
3. **Wpis zmienił nazwę pliku, czyli adres.** Wtedy pyta o ścieżkę, której GoatCounter nigdy nie
   widział — patrz akapit o `src/lib/renames.js` niżej.

Ścieżki GoatCounter zapisuje **bez końcowego ukośnika** (`/wpisy/pl/hello-world`), a strona pyta o oba
warianty, więc to akurat nie jest źródłem problemów.

**Zmiana nazwy pliku wpisu = zmiana adresu = utrata licznika** — GoatCounter kluczuje wizyty ścieżką
i o zmianie nazwy nic nie wie, więc wpis pod nowym adresem pyta o ścieżkę, której serwis nigdy nie
widział, dostaje `404` i licznik znika (tak stało się 2026-08-29 przy przejściu `malowanie` →
`painting-tricks` i dwóch podobnych). Dlatego każdy taki ruch **trzeba dopisać do `src/lib/renames.js`**
— mapa „obecny adres → adresy poprzednie". Czytają ją dwa miejsca:
- `astro.config.mjs` — generuje ze starych adresów strony przekierowujące (meta refresh + canonical +
  `noindex`; na GitHub Pages nie ma gdzie ustawić prawdziwego `301`), żeby stare linki i wyniki
  wyszukiwania nie trafiały w 404;
- licznik (`src/lib/views.ts` przy buildzie i skrypt na stronie wpisu) — pyta o **wszystkie** adresy
  wpisu i **sumuje** wyniki, więc wizyty sprzed zmiany nazwy nie przepadają.

Wpisy w mapie są dożywotnie: stary adres przekierowuje i dokłada swoje wizyty tak długo, jak wpis
istnieje. Scenariusze `features/renamed-posts.feature` pilnują obu połówek.

**Uwaga na przyszłość:** darmowy GoatCounter jest dla użytku **niekomercyjnego**. Gdy blog zacznie
zarabiać (płatna współpraca), przejdź na Cloudflare Web Analytics (darmowy, bez tej klauzuli) albo
Plausible (~9 €/mies., koszt na fakturę JDG, publiczny dashboard dla partnerów) — albo wesprzyj
GoatCounter finansowo i zostań. Przed migracją **wyeksportuj CSV** z GoatCountera: historia nie
przenosi się między narzędziami, a stare liczby warto móc pokazać.

**Google Search Console** (jak ludzie znajdują blog w wyszukiwarce: wyświetlenia, kliknięcia, pozycje):
1. [search.google.com/search-console](https://search.google.com/search-console) → Dodaj usługę → typ **Domena** → `jrobertgardzinski.pl`.
2. Zweryfikuj własność rekordem TXT w DNS u rejestratora (Google poda dokładną wartość).
3. Po weryfikacji: Indeksowanie → Mapy witryn → zgłoś `https://jrobertgardzinski.pl/sitemap-index.xml`.

## Konfiguracja

- `src/config.ts` — tytuł, opis, adresy github/linkedin/youtube (sekcja „gdzie mnie znaleźć" na /o-mnie), shortname Disqusa (puste do czasu rejestracji strony na disqus.com), liczba wpisów na stronę (12).
- `astro.config.mjs` — adres strony, sitemap, motyw kolorowania kodu (zmienne CSS → tokeny Darculi).
- Tokeny kolorów obu motywów: `src/styles/global.css`.

## TODO właściciela

- [ ] właściwe repo w `public/admin/config.yml` (`backend.repo`) oraz `repoUrl` w `src/config.ts` (linki „historia zmian")
- [x] linki github/linkedin w `src/config.ts`
- [ ] zdjęcie na stronę „o mnie" — wrzuć plik do `public/images/` i daj znać (placeholder w paski czeka)
- [ ] zakup domeny `jrobertgardzinski.pl` + rekordy DNS jak wyżej (plik `public/CNAME` już jest)
- [ ] rejestracja bloga na disqus.com → otrzymany shortname wpisz w `src/config.ts` (do tego czasu sekcja komentarzy pokazuje placeholder)
- [x] konto na goatcounter.com → kod `jrobertgardzinski` w `src/config.ts`
- [ ] w panelu GoatCountera włącz „allow using the visitor counter" (bez tego licznik na wpisach milczy)
- [ ] Google Search Console + zgłoszenie sitemapy (po podpięciu domeny)

---
title: "Dzień filmowy"
date: 2026-08-29
section: it
project: shared
tags: [f1, claude, ai, konfiguracja, bdd, ddd]
excerpt: "W F1 dzień filmowy to oficjalnie marketing, a nieoficjalnie pierwszy shakedown. Nagrywając piąty film o własnym systemie, odkryłem, że u mnie jest dokładnie tak samo."
draft: true
---

<!-- ZARYS. Każdy nagłówek = jeden akapit-dwa. Uwagi do siebie w komentarzach HTML. -->

## Otwarcie: 200 kilometrów

<!-- Zaczepka. Krótko o filming day w F1: od 2024 dwa dni po 200 km na sezon (wcześniej 100 km),
opony demo od Pirelli, bolid w homologowanej specyfikacji, zero nowych części. Oficjalnie:
materiał dla sponsorów. Nieoficjalnie: pierwsza jazda nowym bolidem, zanim ktokolwiek ogłosi,
że jest gotowy. Jedno zdanie przejścia: mój piąty film o systemie to był dokładnie mój dzień
filmowy. -->

## Co miałem nagrać

<!-- Jeden akapit o temacie filmu, bez wchodzenia w technikę: minimalna długość hasła jako
decyzja, nie stała. Trzy źródła — kod, plik konfiguracyjny, baza danych — i zasada, że wygrywa
to, które ustawiono najpóźniej. Plus jedna scena z „cwanym kolegą", który wpisuje do bazy
wartość, jakiej system nie przyjmie drzwiami. Pięć scen, osiem minut. Link do filmu, gdy będzie. -->

## Limit kilometrów, nie limit prawdy

<!-- Pierwsza analogia. Bolid na filming day jedzie wolniej i krócej, ale to jest TEN SAM bolid.
U mnie: ten sam serwis, ta sama baza, ta sama klasa, która odmawia przyjęcia trójki. Pięć scen
to ograniczenie kilometrów — nie makieta obok systemu. Puenta: film, w którym system jest
zainscenizowany, nie jest filmem o systemie. -->

## Nieoficjalny shakedown: co przeciekło

<!-- Sedno artykułu. Zespoły F1 nie przyznają, że filming day służy do sprawdzania, czy nic nie
cieknie — ale służy. Lista tego, co wyszło u mnie w trakcie PISANIA SCENARIUSZA, zanim
włączyłem kamerę: -->

<!-- 1. W środowisku deweloperskim nie było admina. Endpoint dla admina istniał, testy
   przechodziły, ale gdyby ktoś odpalił system z pliku compose, nie miałby kim się zalogować.
   Zieleń mówiła o zasięgu testów, nie o gotowości do pokazania. -->

<!-- 2. Hasło „abc" łamie cztery reguły naraz. Do filmu potrzebowałem hasła, które łamie tylko
   długość — i dopiero szukając go, zobaczyłem, że komunikat błędu bez liczby („za krótkie")
   jest bezużyteczny dla widza. I dla użytkownika. Zmiana kształtu odpowiedzi: kod błędu plus
   wartość, która obowiązywała w tej próbie. -->

<!-- 3. Po tej zmianie interfejs pokazałby „[object Object]", a test end-to-end byłby
   zielony — bo sprawdzał tylko, czy na liście błędów coś jest, nie co. Ten sam wzorzec co w
   punkcie 1, w innym miejscu: bramka mierzy swój zasięg, nie kod. -->

<!-- 4. Cache dziesięciu sekund. W testach wyłączony, w dev włączony — więc po zapisie w bazie
   raport przez chwilę pokazuje starą wartość. Decyzja: nie ukrywać, pokazać w kadrze i nazwać
   („zmiana honorowana w ciągu jednego TTL"). Bolid, który przez pierwsze okrążenie jedzie na
   zimnych oponach, też jest w kadrze. -->

<!-- Każdy punkt: jedno zdanie o objawie, jedno o przyczynie, jedno o tym, co z tym zrobiłem.
Bez kodu. -->

## Jedno okrążenie = jeden wiersz z tabeli

<!-- Program filming day jest rozpisany z góry: przejazd, postój, przejazd. Mój był rozpisany
w pliku ze scenariuszami testów — tabela z sześcioma wierszami, z których cztery odegrałem na
żywym systemie po kolei. Scena zero to plansza z rozpiską dnia: pokazuję tabelę, potem ją
odgrywam. Pokazać fragment Gherkina (Scenario Outline + Examples), krótko wyjaśnić, że to jest
test, który się uruchamia, a nie ilustracja. -->

## Zero nowych części

<!-- Druga analogia z regulaminu: na filming day bolid musi być w homologowanej specyfikacji,
nie wolno testować nowych części. U mnie: nagrywam konkretny commit, nie „prawie działającą"
gałąź. Jeśli coś w trakcie nagrania nie zagra, to nie jest materiał na poprawkę na planie — to
sygnał, że scenariusz (spec) kłamie, i film się zatrzymuje jak bolid po czerwonej fladze.
Krótko o tym, dlaczego to dyscyplina, a nie pedanteria: poprawka „na planie" to poprawka bez
testu. -->

## Cztery poprzednie filmy

<!-- Retrospektywa, jeśli starczy materiału: co przeciekło przy filmach 1–4. Jeśli nie pamiętam
— powiedzieć to wprost i zostawić jako obietnicę spisywania od teraz. Ten akapit może być
najkrótszy albo wypaść. -->

## Zamknięcie

<!-- Wróć do 200 km. Zespół nie uczy się z filming day, bo pojechał daleko, tylko dlatego, że
pojechał NAPRAWDĘ. Film o systemie ma sens tylko wtedy, gdy system może się w nim wysypać.
Ostatnie zdanie o tym, że każdy kolejny film będę traktował jak shakedown: najpierw scenariusz,
potem lista przecieków, dopiero potem kamera. -->

<!-- Do rozważenia przy pisaniu:
- Czy wspominać, że kod pisał agent? W „Piaskownicy z memami" już to powiedziałem; tu można
  jednym zdaniem — przecieki z listy wyszły przy pisaniu scenariusza razem, nie z przeglądu kodu.
- Zdjęcie/kadr: tabela Examples obok wyniku curl z tą samą liczbą.
- Tytuł alternatywny: „Filming day" / „Dwieście kilometrów". -->

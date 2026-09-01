---
title: "Konfigurowalność"
date: 2026-09-01
section: it
tags: [architektura]
excerpt: "O poziomach konfiguracji w zależności od ich cyklu życia."
draft: false
---

W publikacjach na temat DDD lub architektury heksagonalnej rzadko pisze się wprost o konfiguracji. Przynajmniej w sposób, w jaki ja o tym myślę. Na potrzeby tego wpisu rozważmy regułę: "klient po zakupie ma 14 dni kalendarzowych na zgłoszenie zwrotu towaru". A co jeśli przepis zmieni ten termin na 20 dni roboczych?

Odpowiedź brzmi: trzeba byłoby przeredagować regułę na coś w stylu: "klient po zakupie ma <RETURN_TIME> na zgłoszenie zwrotu towaru". Wówczas RETURN_TIME składałby się z dwóch wartości: liczby oraz jednostki czasu (minuty, godziny, dni kalendarzowe, dni robocze itd.). Zależnie od tego, skąd i kiedy aplikacja czyta tę wartość, zmiana taka wymagałaby:

a) wydania nowej wersji oprogramowania,

b) ustawienia właściwości w pliku application.properties (to wymagałoby zrestartowania aplikacji),

c) zmiany ustawienia w bazie danych lub serwerze konfiguracyjnym - wówczas nie ma wymogu wydawania nowej wersji albo restartowania systemu.

## Trzy poziomy konfiguracji

Na podstawie powyższych rozważań można zdefiniować trzy poziomy konfiguracji:

Ad. a) konfiguracja wbudowana (rebuild config). Wartość jest częścią wydanej wersji: stała w kodzie albo plik w zasobach (np. application.properties z src/main/resources - ten jedzie do jara). Aplikacja "czyta" ją w momencie budowania. Zmiana to commit, build i wydanie. Zmiany wprowadza programista. Przed złą wartością chroni code review, testy i CI. 
Przykład: Period.ofDays(14) w kodzie.

Ad. b) konfiguracja startowa (restart config). Wartość leży poza wydaną wersją, ale aplikacja czyta ją raz, przy starcie: plik application.properties obok jara, zmienna środowiskowa (environment variable), parametr JVM. Zmiana to edycja i restart - bez nowej wersji. Zmiany wprowadza dev-ops. Jedyna ochrona to proces wdrożenia. 
Przykład: return.time.amount=20 i return.time.unit=BUSINESS_DAYS w pliku obok aplikacji.

Ad. c) konfiguracja na żywo (live config). Wartość leży w źródle dostępnym w czasie pracy - baza danych albo serwer konfiguracyjny - i aplikacja czyta ją przy każdym użyciu albo odświeża co jakiś czas. Zmiana działa od razu, bez wersji i bez restartu. Może ją zrobić administrator albo biznes z panelu. Chroni już tylko to, co aplikacja sama sprawdzi (walidacja w konstruktorze). Warunek: aplikacja nie może wczytać wartości raz i trzymać jej w pamięci na zawsze - wtedy to w praktyce b), tylko z droższym źródłem.

## Wszystkie trzy poziomy naraz

Pójście w kierunku live config przy naszej regule mija się z celem. Rebuild config byłby wystarczający, bo takie przepisy zmieniają się rzadko i informacja o takiej zmianie jest podawana z wystarczającym wyprzedzeniem. Nietrudno jednak wymyślić reguły, gdzie wszystkie trzy poziomy mogą zagrać ważną rolę, np. weźmy na tapet próg darmowej dostawy.

a) W kodzie siedzi wartość domyślna: 200 zł. Zmienia się tylko z wydaniem i to jest jej zaleta - gdy wszystko inne zawiedzie, sklep wciąż wie, od ilu wysyła za darmo.

b) Konkurencja ogłasza darmową wysyłkę od 100 zł. Nie czekamy na wydanie: dopisujemy właściwość shipping.free-from=100 i restartujemy aplikację - wieczorem sklep liczy już po nowemu. Wartość w kodzie zostaje na 200 zł do najbliższego wydania, w którym domyślną też zmieniamy na 100.

c) W Black Friday kierownik sprzedaży podnosi próg z panelu do 400 zł, żeby przy lawinie drobnych zamówień magazyn nie utonął w paczkach - działa od następnego zamówienia, bez restartu. A gdy w pośpiechu wpisze -400 albo «czterysta», walidacja odrzuci wartość i głos dostanie poziom niżej: 100 zł z restartu.

Inny przykład - linie lotnicze i chmura pyłu z islandzkiego wulkanu (2010):
a) kwoty odszkodowań z rozporządzenia EU261 (250/400/600 EUR),
b) waluta, język i procedury per rynek,
c) zniesienie opłat za zmianę rezerwacji na dotkniętych trasach - w godzinę, na czas nieokreślony.

Jak widać, na poziomie c), czyli live config, często pojawia się kwestia czasu ważności. Albo ktoś ręcznie zdejmie ustawienie, kiedy uzna to za stosowne, albo zrobi to za niego data końca - a po jej upływie głos wraca do poziomu niżej.

## Drabinka pierwszeństwa

Co dla mnie ważniejsze: drabinka pierwszeństwa. Definiuje, który poziom wygrywa, kiedy ten sam klucz jest ustawiony na kilku naraz. Kolejność poziomów od najniższego do najwyższego: a), b), c). Ale wyżej nie znaczy "ważniejszy". Każdy poziom przechodzi przez ten sam konstruktor: wygrywa najwyższa wartość, która go przejdzie, a niepoprawna (albo wygasła) jest pomijana i głos dostaje poziom niżej - aż do kodu, który jest zawsze poprawny.

W języku heksagonu: domena dostaje gotowy, poprawny obiekt przez port. Cała drabinka - poziomy, pierwszeństwo, walidacja - to adapter. Domena nawet nie wie, skąd wartość przyszła.

Do live config powinna zostać przypisana gwiazdka z następującymi uwagami:
1. jeśli wartość ustawienia zapisywana jest do bazy danych za pośrednictwem solidnie zaprojektowanego systemu, który waliduje stan obiektu podczas tworzenia (parse, don't validate), wówczas jest ona tak samo bezpieczna jak każde inne dane, które aplikacja przyjmuje z zewnątrz.
2. jeśli wartość trafia do bazy bezpośrednio (UPDATE z konsoli, skrypt, inny serwis), omija bramkę z punktu 1 - baza sprawdzi tylko to, co wyraża schemat, a reszta reguł siedzi w konstruktorze, którego nikt nie wywołał. Fowler nazywa taką tabelę bazą integracyjną (integration database): pisze do niej kilku, więc reguł musi pilnować każdy z osobna, a Newman wprost odradza integrację przez wspólną bazę - dane mają być schowane za serwisem, który je posiada. Efekt: wiersze, których aplikacja nie umie sparsować, instancje z różnymi wartościami w pamięci i zmiany, o których nikt nie wie.

## Film

W poniższym filmie przedstawiam tę koncepcję na prostym scenariuszu: minimalna długość hasła przy rejestracji nowego użytkownika. Spróbuję wymusić minimum 3 znaki, podczas gdy kod pilnuje, żeby nie zejść poniżej 5. Najpierw z panelu administracyjnego, a gdy system odmówi - bezpośrednio w bazie. Niepoprawny klucz zostaje pominięty z ostrzeżeniem w logu, a głos dostaje poziom niżej.

Scenariusze z filmu opisane w Gherkinie: [LINK DO PLIKU FEATURE]

[FILM]
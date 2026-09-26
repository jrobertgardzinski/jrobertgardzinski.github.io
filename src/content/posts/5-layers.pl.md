---
title: "5 warstw"
date: 2026-09-01
section: it
tags: [architektura]
excerpt: "Sposób na pozbycie się serwisów"
draft: false
---
Podbijasz bibliotekę o wersję główną (major) i coś cicho przestaje działać. Łatasz podatność (CVE) rozlaną w całym projekcie. Testy są, bo są. Każdy je ignoruje do czasu aż któryś nie przejdzie. Przyczyna jedna: logika, framework i sieć siedzą w tych samych klasach. Poniżej mój podział na pięć warstw, pokazany na module security z portfolio - od domeny, która nie wie, że istnieje Spring, po infrastrukturę, gdzie Spring dopiero wchodzi.

## Biblioteka

Zanim powstanie mikroserwis, warto powydzielać biblioteki.

1. Domena

Definicja: Najniższa, czysta warstwa logiczna zawierająca obiekty wartości (Value Objects), które same dbają o swoją poprawność (są samowalidujące się).

Rola: Zdefiniowanie absolutnych fundamentów logicznych systemu, które są niezależne od jakichkolwiek konfiguracji zewnętrznych czy sposobu uruchomienia.

2. Konfiguracja statyczna

Definicja: Warstwa parametryzująca zasady domenowe i czyniąca je elastycznymi. Statyczna, czyli czytana raz, w trakcie uruchamiania programu i obowiązująca przez cały czas jego trwania.

Rola: Przekłada dynamiczne lub zewnętrzne reguły (np. wymagana długość hasła, znaki specjalne) na konkretne zestawy ograniczeń (np. Constraints), które są wstrzykiwane wyżej. Czas wejścia w życie zmian zależy od źródła (zapisana w kodzie na sztywno, pliki właściwości/argumenty startowe czy dane z bazy/rejestru).

3. Przypadki użycia

Definicja: Operacje na obiektach. Łatwe w testowaniu w izolacji.

Rola: Wystawia interfejs dla warstwy systemowej (pkt 3 w następnym rozdziale). 

* Konfiguracja dynamiczna

Definicja: Wpinam ją do trzeciej warstwy - przypadków użycia. Dodaje kolejne źródło konfiguracji. Dynamiczne, czyli czytane z bazy danych, z pamięci programu itd. Daje możliwość nadpisania konfiguracji. 

Rola: Wprowadziłem tę opcjonalną warstwę w celu nadania większej elastyczności do konfiguracji. W skrócie: system może przeczytać konfigurację tylko raz, podczas uruchamiania lub czytać ustawienia z bazy danych i to ostatnie źródło może przysporzyć kłopotów. Ktoś np. zechce pominąć konfigurowanie z panelu sterowania i wprowadzić nieprawidłową wartość bezpośrednio w bazie danych, powodując niespójność w danych. Więcej na ten temat: https://jrobertgardzinski.pl/wpisy/en/configurability/

## Monolit / mikroserwis

Różni się od powyższego od trzeciej warstwy wzwyż.

1. Domena 

2. Konfiguracja 

3. ~~Przypadki użycia~~ System

Definicja: Pojemnik na atomowe (tzn. małe, proste) przypadki użycia (use cases), które spinają Domenę z Konfiguracją - np. sprawdzenie hasła wobec polityki haseł (password policy) albo utworzenie obiektu użytkownika z adresu e-mail i hasła.

Rola: Dostarcza gotowe klocki, z których korzysta warstwa Aplikacja. Sam nie układa przebiegu biznesowego, nie decyduje o kolejności kroków i nie komunikuje się ze światem zewnętrznym.

* Konfiguracja drabiniasta (drabina) - można wpiąć do warstwy systemowej.

4. Aplikacja

Definicja: Warstwa orkiestrująca - składa klocki z warstwy System w pełne scenariusze biznesowe (np. rejestracja użytkownika Register) i przygotowuje grunt pod framework: interfejsy repozytoriów i kontrolery, jeszcze bez adnotacji.

Rola: Orkiestruje przebieg - weryfikuje warunki, podejmuje decyzje, ustala kolejność kroków i deleguje wykonanie w dół. Jest zarazem punktem wejścia dla logiki aplikacyjnej: ten sam przypadek użycia udostępnia w różnych kontekstach, tłumacząc dane z zewnątrz na język domeny.  

5. Infrastruktura

Definicja: Warstwa techniczna i komunikacyjna nakierowana na sieć oraz zasoby zewnętrzne.  

Rola: Obsługuje odbieranie i przesyłanie danych przez sieć, bazę danych, zewnętrzne API czy integracje sprzętowe. Wspólnie z warstwami aplikacji i UI może realizować te same scenariusze BDD, ale na poziomie komunikacji sieciowej. Tu dopiero pojawia się framework - klasy przygotowane w warstwie Aplikacja są dziedziczone i dostają adnotacje Springa (@Controller, @Repository, @Service).

## Inne warstwy

Dalej już tylko jest kontener dockerowy i UI czyli interfejs użytkownika: najczęściej aplikacja mobilna albo strona internetowa. Trzeba je aktualizować celem minimalizacji podatności.

## Testowanie

Przy takim rozgraniczeniu znika pojęcie serwisu, który w moim mniemaniu powinien być ograniczony do adnotacji w Springu. Zapomnij o serwisie domenowym, aplikacyjnym i infrastrukturalnym. Tutaj liczą się przypadki użycia, pokryte testami BDD. A więc teraz o testach:

* domena, konfiguracja, system: testy jednostkowe (JUnit) z raportem Allure i wygenerowanej z niego dokumentacji, plus javadoc na wyjaśnienie pojęć.
* aplikacja, infrastruktura, UI: BDD (behavior-driven development) w Cucumberze - jeden plik feature (Gherkin), a każda warstwa ma własne definicje kroków (step definitions): aplikacja wywołuje czysty kod, infrastruktura wysyła żądanie HTTP, UI wypełnia formularz i klika.

Scenariusze BDD to wysoki poziom abstrakcji dla biznesu, raport Allure to detale pod maską dla techników.

## Film

PRZYKŁAD GHERKIN > ALLURE

pomysł na film:
analiza register.feature. Dlaczego? Wisi w dwóch raportach:
http://localhost:63342/git/shared/microservice-security/security-application/target/report.html?_ijt=u66ngesqko641300qps4diefhc&_ij_reload=RELOAD_ON_SAVE
http://localhost:63342/git/shared/microservice-security/security-infrastructure/target/report-http.html?_ijt=u66ngesqko641300qps4diefhc&_ij_reload=RELOAD_ON_SAVE
A to znaczy, ze min. 2 testy implementują jeden gherkin. Dobrze chyba, nie?
Dalej, Register use case wymaga refactora, bo kod jest dupny. 
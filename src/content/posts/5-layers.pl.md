---
title: "5 warstw"
date: 2026-09-01
section: it
tags: [architektura]
excerpt: "Sposób na pozbycie się serwisów"
draft: false
---
Podbijasz bibliotekę o wersję główną (major) i coś cicho przestaje działać. Łatasz podatność (CVE) rozlaną w całym projekcie. Testy są, ale nikt ich nie czyta. Przyczyna jedna: logika, framework i sieć siedzą w tych samych klasach. Poniżej mój podział na pięć warstw, pokazany na module security z portfolio - od domeny, która nie wie, że istnieje Spring, po infrastrukturę, gdzie Spring dopiero wchodzi.

## Definicje

1. Domena 

Definicja: Najniższa, czysta warstwa logiczna zawierająca obiekty wartości (Value Objects), które same dbają o swoją poprawność (są samowalidujące się).  

Rola: Zdefiniowanie absolutnych fundamentów logicznych systemu, które są niezależne od jakichkolwiek konfiguracji zewnętrznych czy sposobu uruchomienia.

2. Konfiguracja

Definicja: Warstwa parametryzująca zasady domenowe i czyniąca je elastycznymi.

Rola: Przekłada dynamiczne lub zewnętrzne reguły (np. wymagana długość hasła, znaki specjalne) na konkretne zestawy ograniczeń (np. Constraints), które są wstrzykiwane wyżej. Czas wejścia w życie zmian zależy od źródła (zapisana w kodzie na sztywno, pliki właściwości/argumenty startowe czy dane z bazy/rejestru).  

3. System (małe przypadki użycia)

Definicja: Pojemnik na małe, zwykle jednokrokowe przypadki użycia (use cases), które spinają Domenę z Konfiguracją - np. sprawdzenie hasła wobec polityki haseł (password policy) albo utworzenie obiektu użytkownika z adresu e-mail i hasła.

Rola: Dostarcza gotowe klocki, z których korzysta warstwa Aplikacja. Sam nie układa przebiegu biznesowego, nie decyduje o kolejności kroków i nie komunikuje się ze światem zewnętrznym.

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
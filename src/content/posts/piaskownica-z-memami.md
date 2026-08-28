---
title: "Dwa lata w piaskownicy"
date: 2026-08-29
section: it
project: portal
tags: [claude, ai, mikroserwisy, kafka, ddd]
excerpt: "Serwis bezpieczeństwa pisałem sam przez dwa lata. W lipcu agent postawił wokół niego cały portal w dwa tygodnie — razem z sagą, która kasowała konta na ślepo."
draft: false
---

Dziś umiem w tym projekcie trzy rzeczy: odpalić go, poklikać i ponarzekać, że pewne rzeczy zrobiłbym lepiej. Kod pisze Claude.

To nie jest skarga. To podsumowanie projektu, który założyłem po to, żeby po godzinach przerobić od podstaw tematy, które mnie ciekawią: rozproszone transakcje, kilka smaków JVM, obserwowalność, przygotowanie pod wdrożenie na klaster. W lipcu straciłem kontrolę nad własną piaskownicą, choć system stoi, działa i ma testy.

## Dlaczego akurat memy

Bo domena jest trywialna. Wrzucasz obrazek, ktoś go komentuje, ktoś głosuje. Nie ma tu żadnej biznesowej zawiłości do rozgryzienia, więc cała trudność ląduje dokładnie tam, gdzie ją chciałem mieć: w integracji serwisów, w spójności danych rozsypanych po kilku bazach, we wdrożeniu.

Najlepiej widać to na wyborze brokera. Kiedy przyszło do komunikacji asynchronicznej, Claude przekonywał mnie do NATS JetStream — słusznie, bo do kilku mikroserwisów użycie Kafki jest jak strzelanie z armaty do wróbla. Uparłem się na Kafkę właśnie dlatego, że to jest piaskownica: chcę mieć na pokładzie narzędzie, które mogę spotkać w pracy, i chcę mieć otwartą drogę do dokładania kolejnych konsumentów. W planach jest dodanie powiadomień, audytu, OCR memów i opcja wyszukiwania po wyłuskanym tekście. W projekcie na produkcję argument agenta byłby lepszy.

Zanim zacząłem modelować domenę memów i komentarzy, pomyślalem, że dobrze byłoby zadbać najpierw o bezpieczeństwo. W Springu jest moduł Security. Kwestia konfiguracji i z głowy. Ja jednak chciałem wykorzystać okazję i spróbować napisać własny system. Tym bardziej, że w jednej z dyskusji na temat DDD znalazłem dwie szkoły mówiące o bezpieczeństwie: falenicka - security nie ma nic do DDD, otwocka - nie ma przeciwwskazań żeby użyć DDD w security. Wystarczyło mi kilka wieczorów by zrozumieć, że DDD robi fantastyczną robotę na tym polu.

Myślę, że rozpoczęcie pracy od security ma zalążek w moim doświadczeniu zawodowym. Dwukrotnie pracowałem nad dużymi rzeczami powiązanymi z tą tematyką, więc trzecie podejście wydawało mi się być niezłym pomysłem na odkupienie win.

## Dwa lata w piaskownicy

Sięgnąłem do gita, żeby nie zmyślać, i liczby wyszły brutalniejsze, niż pamiętałem.

**Czerwiec 2024 – sierpień 2025 : bez żadnej asysty.** 

Trzydzieści pięć commitów przez czternaście miesięcy. Efekt: rejestracja, uwierzytelnianie, odświeżenie sesji i trzy warstwy heksagonu — domena, aplikacja, infrastruktura, gdzie:

* domena - logika biznesowa, która powinna modelować rzeczywiste problemy biznesowe.
* aplikacja - zarówno tworzenie i odczytywanie obiektów domenowych jak i wywoływanie ich metod w celu spełnienie żądania użytkownika. 
* infrastruktura - komunikacja z zewnętrznym światem: serwisy webowe, bazy danych czy innych zasobów. 

[źródło: https://www.hibit.dev/posts/15/domain-driven-design-layers ]

Charakterystyczne, że najczęściej powtarzającym się słowem w komunikatach commitów z tego okresu jest „give up": porzucona walidacja Hibernate'a, porzucone eventy, porzucone rekordy na rzecz Lomboka. 

Etap ten zwieńczony został krótkim filmem z ręcznych testów infrastruktury.

https://youtu.be/nX685z_-UNQ

**Wrzesień – grudzień 2025 : listingi wklejane do ChatuGPT.** 

Czterdzieści commitów. Asysta przez schowek pomaga dokładnie tam, gdzie problem mieści się w jednym pliku i jednym pytaniu — u mnie było to hashowanie haseł i nazewnictwo klas. Architektura dalej powstawała ręcznie. Wtedy też rozbiłem trzy warstwy na pięć, bo domena i aplikacja to dla mnie za mało.

* domain,
* config - wyspecjalizowana domena skupiona na konfiguracji, np. konfigurowalna polityka haseł (długość hasła, regex pod wymaganie znaków specjalnych, itd.)
* system - pojemnik na przypadki użycia: odśwież sesję; 
* application - gdy system to za mało, potrzebny jest orkiestrator przypadków użycia. Aby zarejestrować użytkownika, należy sprawdzić, czy email nie jest już zajęty, albo czy polityka haseł została spełniona. Uwierzytelnianie z zabezpieczeniem na brute force to już w ogóle! Licznik blokady: inkrementacja na niepowodzenie uwierzytelniania albo wyzerowanie przy udanej próbie zalogowania lub po ustawieniu blokady czasowej na uwierzytelnianie. Brute force też dobrze żeby raz zablokował dostęp na 10 minut, potem na 3, żeby utrudnić robotę botowi. Dopiero gdzieś na końcu pojawia się szczęśliwe zakończenie, czyli udana próba zalogowania.
* infrastructure

**Styczeń – czerwiec 2026: Claude Code na taryfie Pro.**

To był przeskok, ale nie taki, jakiego się spodziewałem: dwieście czterdzieści pięć commitów przez pół roku i dalej **te same trzy przypadki użycia**. Zaczynałem nieśmiało - zmień nazwę klasy, zrób code review - a skończyłem na prowadzeniu BDD przez wszystkie warstwy. Styczeń jest jedynym miesiącem w całej historii projektu, w którym skasowałem więcej linii, niż napisałem. Nie powstała wtedy żadna nowa funkcja. Powstała za to dyscyplina.

## Lipiec 2026: 716 commitów

Wykupiłem Max 20x z jednym konkretnym zamiarem — zlecić agentowi warstwę infrastruktury, której nie chciało mi się klepać. W trakcie rozmowy okazało się, że skoro już, to wypadałoby dodać kilka przypadków użycia. Potem zacząłem zlecać tworzenie kolejnych serwisów na podobieństwo security. Do tego wrócił Fable 5, ogłaszany jako dostępny „przez tydzień", potem przez kolejny, więc zacząłem wyciskać z niego maksimum, zanim zniknie.

W trzydzieści dni w repozytoriach wylądowało **716 commitów i siedemnaście nowych repozytoriów**. Dla porównania: całe dwa lata przed lipcem to 320 commitów. Najgęstsze dni to 29 lipca (146 commitów) i 7 lipca (116). Z serwisu logowania zrobił się portal: galeria, komentarze, kolekcje ulubionych, enkoder obrazów, saga usuwania konta, a pod spodem wspólne jądro — poczta, SMS, push, stub OIDC, weryfikacja tokenów offline, outbox, Kafka, Postgres, MinIO, Prometheus z Grafaną i Loki.

Najciekawszy efekt uboczny jest taki, że mam dziś w jednym produkcie **cztery frameworki JVM**:

| serwis | framework |
|---|---|
| memy, komentarze | Spring Boot |
| kolekcje, offboarding | Helidon 4 SE |
| poczta | Quarkus |
| security | Micronaut |
| enkoder obrazów, stub IdP, SMS, push | Python |

Chciałem poznać inne frameworki. Springa znam dobrze i to właśnie dlatego chciałem zobaczyć, jak te same problemy rozwiązuje się gdzie indziej. Najpierw wszedł Micronaut, potem Quarkus. Oba wstrzykują zależności w trakcie kompilacji, co skraca czas ich uruchomienia względem Springa, który rozwiązuje zależności w trakcie działania programu (runtime). Potem doszedł Helidon, który do dziś jest dla mnie abstrakcją — wiem, że działa, nie wiem, jak.

## Co wyszło spod tego tempa

**Saga, która kasowała na ślepo.** Usunięcie konta musi przejść przez pięć serwisów: memy, komentarze, kolekcje, security i orkiestratora. Pierwsza wersja wyjechała 11 lipca i wyglądała na skończoną — dopóki nie zapytałem, co się stanie, gdy trzeci uczestnik odmówi. Odpowiedź: nic. Kasowało wszystko po kolei, bez kompensacji i bez drogi powrotu. Musiałem ostro naciskać, żeby to przebudować. Reguła „najpierw ukryj, potem skasuj" i pierwszy zielony przebieg testów kompensacji są z **8 sierpnia** — cztery tygodnie po tym, jak temat był „zrobiony".

**Model, który żył w 2024 roku.** Infrastruktura powstała szybko i sprawnie, tylko oparta o wersje narzędzi z okolic daty granicznej modelu. Manifesty k8s napisane 25 lipca 2026 od pierwszego dnia niosły bazę z 2023. Drzewa Mavena i npm były przy tym świeże, bo tych pilnował Dependabot; obrazów i akcji nie pilnował nikt. Commit z 30 lipca podpisany „obrazy i akcje przestają być pamiątką po dacie granicznej modelu" podniósł to do aktualnych wersji, a Postgres 18 od razu upomniał się o inny układ wolumenu niż ten, który wygenerował agent.

| narzędzie | agent wygenerował | po aktualizacji |
|---|---|---|
| Postgres | 16-alpine (IX 2023) | 18-alpine |
| Kafka | 3.9.1 | 4.3.1 |
| MinIO | RELEASE.2024-06-13 | RELEASE.2025-09-07 |
| Grafana | 11.1.0 | 13.1.1 |
| Prometheus | v2.53.0 | v3.13.2 |
| Loki | 3.1.0 | 3.7.4 |
| Tempo | 2.5.0 | 2.9.4 |
| Promtail | 3.1.0 | 3.6.11 |
| node-exporter | v1.8.1 | v1.12.1 |
| cAdvisor | v0.49.1 | v0.55.1 |
| actions/checkout | v4 (141 pinów) | v7 |
| setup-java / setup-node / setup-python | v4 / v4 / v5 | v5 / v7 / v7 |

**Prawie dwadzieścia planów naprawczych.** Kiedy zacząłem puszczać pełne code review Fable 5 na maksymalnym wysiłku, model znalazł tyle, że musiałem to rozpisać na osobne dokumenty: `PLAN-P10` do `PLAN-P18`, plus audyt całości i plan kompensacji. Jeden taki przebieg zjadał połowę sesji. Bywało, że review potrafiło zakwestionować poprawki z poprzedniego review — i miało rację.

**Proporcja, która mówi wszystko.** W lipcu na każde sto dodanych linii usunąłem dwadzieścia jeden. To najniższy wynik w całej historii projektu — niższy niż wtedy, gdy pisałem wszystko ręcznie i bez żadnej asysty. Przez pół roku na Pro ta liczba trzymała się w okolicach osiemdziesięciu. Innymi słowy: **asystent nie sprawił, że więcej wyrzucam. Sprawił, że stać mnie na siedemnaście nowych repozytoriów naraz.**

## Czego w tym projekcie nie ma

Bo lista rzeczy zrobionych bez listy rzeczy niezrobionych to folder reklamowy.

Nie ma wdrożenia. Manifesty pod k3s są napisane i sprawdzone, ale nic z tego nie stoi na żadnym klastrze i na razie nie zamierzam tego stawiać. Nie ma analizy RODO, a portal, na którym ludzie zakładają konta i wrzucają treści, bez niej nie ma prawa wyjść do świata. Nie ma też — i to boli najbardziej — mojego przeglądu warstwy infrastruktury. Powstała pod agentem i oglądałem efekty, nie kod.

W sierpniu zszedłem na Max 5x, bo na najwyższej taryfie łapałem się na tym, że czuję presję, żeby wykorzystać limity, zamiast robić to, co ma sens. Tańszy plan wymusza pytanie „czy to zlecenie jest tego warte", a to okazało się zdrowe.

## Co z tego wynika

Nie sądzę, żeby AI zabrała nam pracę. Bliżej mi do analogii z kalkulatorem naukowym: nie zlikwidował inżynierów, tylko pozwolił im projektować rzeczy, których wcześniej nie opłacało się liczyć. Podobnie jest tutaj — z asystentem stać mnie na system, którego po godzinach nie napisałbym nigdy.

Ale dwa lata tego projektu nauczyły mnie czegoś mniej pocieszającego. **Zlecić można pisanie. Rozumienia zlecić się nie da.** Gdy w lipcu oddałem jedno i drugie, dostałem działający produkt i przestałem być jego autorem — a kod, którego nie rozumiem, jest moim długiem, nie zasługą agenta. Saga kasująca na ślepo nie wyszła w testach. Wyszła, bo zadałem pytanie.

Więc plan na najbliższe miesiące jest nudny i celowo taki zostanie: przejść przez infrastrukturę własnymi oczami, domknąć paczki z review, ogarnąć RODO, a dopiero potem myśleć o wdrożeniu. Bez pośpiechu, bo to nadal jest piaskownica — a od piaskownicy wymagam jednego: żebym się w niej czegoś nauczył. Reszta może poczekać.

<p class="mono-comment">// projekt: 23 repozytoria, 1118 commitów, cztery frameworki JVM i jeden właściciel, który nadrabia zaległości</p>

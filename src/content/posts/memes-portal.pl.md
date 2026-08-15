---
title: "Portal z memami - moja piaskownica"
date: 2026-07-25
section: it
tags: [hexagonal, ddd]
excerpt: "O mojej podróży w budowie systemu zgodnego ze sztuką."
draft: true
---

Z doświadczenia wiem, że projekty robione na własne potrzeby procentują najbardziej. Jako, że jestem w tej branży od prawie 10 lat i widziałem już wiele, staram się zgłębiać wiedzę w różnych zakresach. Brałem udział w konferencjach, na których dużo mówiono o DDD (Domain Driven Design), architekturze heksagonalnej (Hexagonal Architecture) itd. Z początku oczywiście nie rozumiałem wszystkich tych pojęć, ale założenia stojące za nimi skradły moją ciekawość.

Dla niewtajemniczonych, pokrótce:
* DDD - wspólny język dla biznesu (grupy ludzi, dla której robimy oprogramowanie) i zespołu technicznego (głównie programiści, potem testerzy, administratorzy, kierownicy itd.). 
Przykłady:
#1 Robimy oprogramowanie dla lekarzy. Jako programista nie muszę mieć opanowanych wszystkich zawiłych reguł wystawiania recept. Wystarczy zbudować wokół medycznych zagadnień model danych -> abstrakcję -> domenę i już mówimy tym samym językiem co lekarze. 
#2 System księgowości i przepisy podatkowe w Polsce. W czasie COVIDa rozporządzenia były pisane na kolanie i wdrażane z dnia na dzień.
#3 Oprogramowanie do zbierania danych z jazd testowych samochodem, głównie do pomiaru emisji spalin, ale warto też ogarnąć temat wypalania filtra DPF.
* Hexagonal Architecture - chyba każdy widział te diagramy z portami i adapterami. Po środku jest domena, która wystawia porty, wokół są pobudowane adaptery, najczęściej jeden moduł w danym frameworku, np. Spring. Programiści wykształceni na książkach typu "Spring in Action" albo "Spring Microservices in Action" mogą uważać za niepotrzebne tworzenie encji i Value Objectów z konwencji DDD, żeby potem mapować je na encje jpa, ale wizja możliwości łatwiejszej przesiadki na inny framework czy rozbicia pojedynczego systemu na kilka mniejszych (mikroserwisy) jest kusząca.

## Założenia projektu

1. Nauka nowych technik i narzędzi tworzenia oprogramowania.
2. Serwis z memami, gdzie poza biernym scrollowaniem memów i przeglądaniem ich komentarzy, można wziąć aktywny udział w tej zabawie, dodając własne obrazki, komentując, oddając głosy... W myśl DDD wydzieliłbym następujące Bounded Countexty: mem (obraz), komentarz, głos (głosujemy na komentarz i mem, czyli context mapa jest potrzebna). Dodatkowo potem pojawił się pomysł z zaznaczaniem ulubionych memów i komentarzy. Ogólnie ten system daje mnóstwo możliwości rozwoju jak choćby wzbogacenie go o powiadomienia, OCR tekstu na memach i wyszukiwanie po wyłuskanej treści, może jakaś cenzura na wulgaryzmy.

## Kronika

Kod tytułowego projektu przechodził przez kilka etapów.

### Klasyczne podejście rzemieślnicze (06.2024 - 08.2025)

Projekt założylem w czerwcu 2024 roku. Ponad rok zajęło mi poskładanie wszystkiego w całość, zgodnie z technikami opisanymi na wstępie artykułu. Efektem był prosty serwis bezpieczeństwa, gdzie można było zarejestrować użytkownika podając email oraz hasło, potem uwierzytelnić się a następnie odświeżyć token sesji. Dowiozłem 3 warstwy z hexagonal: domena, aplikacja, infrastruktura, ale czegoś mi brakowało.

### Wspomaganie wrzucaniem listingów do Chata GPT i innych (09.2025-12.2025)

Etap ten zbiegł się z przebudową hexagona w moim projekcie. Stwierdziłem, że 3 warstwy to dla mnie za mało i wydzieliłem:
* domain,
* config - wyspecjalizowana domena skupiona na konfiguracji, np. konfigurowalna polityka haseł (dłguość hasła, regex pod wymaganie znaków specjalnych, itd.)
* system - pojemnik na przypadki użycia: odśwież sesję;
* application - gdy system to za mało. Aby zarejestrować użytkownika, należy sprawdzić, czy email nie jest już zajęty, albo czy polityka haseł została spełniona. Uwierzytelnianie z zabezpieczeniem na brute force to już w ogóle! Licznik blokady: inkrementacja na niepowodzenie uwierzytelniania albo wyzerowanie przy udanej próbie zalogowania lub po ustawieniu blokady czasowej na uwierzytelnianie. Brute force też dobrze żeby raz zablokował dostęp na 10 minut, potem na 3, żeby utrudnić robotę botowi. Dopiero gdzieś na końcu pojawia się szczęśliwe zakończenie, czyli udana próba zalogowania.

### Claude Code (taryfa Pro) (01.2026-06.2026)

To był gamechanger! AI na moim kompie, z dostępem do kodu. Początki były nieśmiałe. Prosiłem głównie o rename zmiennej albo klasy. Potem prosiłem o jakieś code review. A kiedy się rozkręciłem, to kazałem skupić się na BDD (Behaviour Driven Development), czyli pisaniu scenariuszy testowych i testów do nich na warstwach: application, infrastructure i UI. Pół roku zajęło mi dowiezienie podstawowych trzech przypadków użycia: rejestracja, uwierzytelnianie, odświeżenie sesji. Dowiozłem połowicznie, bo do warstwy aplikacji miałem wszystko całkiem nieźle porobione. 

### Miesiąc na taryfie Max 20x (07.2026)

Postanowiłem zdać się całkowicie na agenta AI i zlecić mu implementację warstwy infrastruktury. Szybko jednak plany eskalowały, gdy w trakcie rozmowy wynikło, że wypadałoby dodać jeszcze kilka przypadków użycia. Jako, że lipiec to był miesiąc powrotu modelu Fable 5 to zachłyśnięty marketingiem postanowiłem zlecić mu robotę przy innych mikroserwisach w oparciu o dotychczasowy kod (struktura, testy). Fable 5 był ogłaszany jako dostępny przez tydzień, potem przez kolejny tydzień itd. aż końcu go zostawili na stałe dla taryf Max. Przez tę ograniczoną dostępność próbowałem wycisnąć z modelu i z limitów Claude maksimum zanim stracę dostęp do Fable 5. W ten sposób AI dowiozło mi gotowy system w tydzień, albo 2. 

Wszystko było ok dopóki nie zacząłem zlecać mu robienia code review na cały projekt, modelem Fable 5, na effort ustawionym na ultracode. Tokeny zżerał niemiłosiernie, ale jeden taki pełen przebieg na cały kod był w stanie zrobić w jakieś 50% sesji. Wyrabiał się w limitach, bym później mógł mu zlecać robienie poprawek do znalezionych błędów. Takich potknięć po swojej robocie Claude znalazł i przygotował prawie 20 paczek i nadal nie widać końca!

Code review na modelu Fable 5 i effort ultracode jest też o tyle niebezpieczny dla niższych taryf, że Claude potrafi odpalić równolegle kilku agentów czytających kod. To pali tokeny bardzo szybko.

Inna wpadka jaką odkryłem to robota jaką wykonał Claude przy implementacji wartwy infrastruktury. Co prawda oszczędziłem mnóstwo czasu na podpinanie baz danych, narzędzi do observability itd., ale model, którego użyłem do tego celu działał na materiałach z roku 2024. Kilka wersji bazowych użytych narzędzi miała właśnie wtedy premierę. Gdy to odkryłem to natychmiast napisałem kilka promptów z żądaniem aktualizacji od najnowszych dostępnych wersji!

### Obecnie na taryfie Max 5x (08.2026 - ?)

Doświadczenia z lipca oraz moja preferencja do używania modelu Fable 5 zachęciła mnie do skorzystania z niższego planu Max 5x. Najwyższa taryfa do moich zastosowań jest zbyt wygórowana. Nierzadko czułem presję na przepalenie tokenów. 

Uczę się projektu, który zacząłem pisać samodzielnie i odnajdowałem się w nim dobrze jeszcze w czerwcu 2026. Napisałem "dobrze", bo miałem rozpisanych kilka komentarzy "todo" na refactoringi w warstwach poniżej infrastruktury. 

Dziś jedyne co potrafię to odpalić projekt, poklikać celem przetestowania i narzekać, że sam zrobiłbym pewne rzeczy lepiej, ale oczywiście zajęłoby mi to dużo czasu, a że trudno jest pisać kod do szuflady po godzinach to postanowiłem zrobić przerwę i napisać ten artykuł.

## Wnioski

AI nie zabierze nam pracy. Bardzo podoba mi się analogia do wynalezienia kalkulatorów naukowych. Ich wdrożenie miało spowodować panikę w branży budowlanej, a okazało się jedynie narzędziem, które pozwoliło budowniczym stawiać bardziej wyszukane i coraz to bezpieczniejsze konstrukcje. Podobnie ma się rzecz z oprogramowaniem. Jest całe mnóstwo dojrzałych systemów, w których AI może wspomóc programistę w zrozumieniu kodu i wybraniu rozwiązania. Pisanie kodu to sztuka kompromisu. Pewne rozwiązania mogą wydawać się wadliwe i zbyt proste, ale w konkretnych przypadkach ich użycie ma rację bytu. 

Był moment kiedy stanąłem przed wyborem brokera wiadomości do komunikacji asynchronicznej. Claude próbował mnie przekonać do NATS JetStream, bo do tych kilku raptem mikroserwisów Kafka jest zbyteczna, ale ja się uparłem na Kafkę z uwagi na to, że projekt serwisu z memami to jest moja piaskownica, w której testuję powszechnie używane technologie i mając Kafkę na pokładzie, mam drogę wolną do tworzenia kolejnych konsumentów (powiadomienia, audyt).

Dziś nie wyobrażam sobie pracy bez asystenta AI. Może co najwyżej żeby powspominać jak to było kiedy samemu pisało się kod. Doświadczenie zebrane z pracy nad tym projektem nauczyło mnie żeby nie zdawać się całkowicie na AI i zaglądać często do kodu, żeby poprawiać niedociągnięcia zawczasu.
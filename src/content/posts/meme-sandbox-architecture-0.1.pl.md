---
title: "Piaskownica z memami - architektura wersji 0.1"
date: 2026-09-11
section: it
project: portal
tags: [architektura]
excerpt: "Ogólny zarys architektury mikroserwisowej. Plany na wersje 0.2 oraz 1.0."
draft: false
---

Większość mikroserwisów [portalu z memami](/wpisy/pl/meme-sandbox/) powstała w Javie, jedynie stuby i enkoder obrazów były pisane w Pythonie. Dlaczego Java? Dojrzały ekosystem, bogactwo narzędzi i skupienie na testach, z których później generowana będzie dokumentacja. Tam, gdzie Java, stosuję DDD i architekturę heksagonalną, a w prostszych przypadkach BCE (Boundary-Control-Entity). Przyjąłem zasadę, że stuby oraz mikroserwisy bez logiki domenowej i bez dokumentacji do wygenerowania piszę w Pythonie, np. konwersję obrazów.

## Dlaczego mikroserwisy

To jest poligon doświadczalny. Chcę zbadać:

* jak system zachowuje się, kiedy wybrane serwisy zostają wyłączone
* komunikację synchroniczną i asynchroniczną
* testowanie systemu rozproszonego

Kiedy wydam wersję 1.0, planuję dwa kroki:

* naprzód - dorzucić skalowanie
* wstecz - przejść do architektury monolitycznej. Wiem, że wiele osób zaleca zaczynać od monolitu, ale to ograniczyłoby frajdę z budowania wersji 0.1, 0.2 oraz 1.0. Chciałbym doprowadzić do sytuacji, w której aplikacji frontendowej nie będzie robiło większej różnicy, czy komunikuje się z monolitem, czy z mikroserwisami.

## Architektura

![Diagram architektury](../image/architecture-0.1.webp)

To widok z lotu ptaka: same mikroserwisy i ich zależności, bez komunikacji, baz danych i wdrożenia.

W ramce "security" widać trzy mikroserwisy:

* **core-microservice-security**: generyczny mikroserwis bezpieczeństwa. Pojemnik na przypadki użycia takie jak uwierzytelnianie czy rejestracja. Dwa poniższe mikroserwisy współpracują z nim.
* **microservice-idp**: w środowisku deweloperskim służy jako stub dostawców tożsamości, takich jak Google czy GitHub.
* **microservice-saga-offboarding**: orkiestrator sagi usuwania konta. Funkcjonalność umyślnie została wydzielona do osobnego mikroserwisu z uwagi na wiedzę domenową o portalu z memami.

Na prawo od sekcji "security" ustawiony jest **microservice-email**, którego zadaniem jest wysyłanie maili do zatwierdzenia rejestracji konta. To jest jego jedyny cel istnienia. Mógłbym go wciągnąć do sekcji security, ale wysyłanie maili nie ma nic wspólnego z bezpieczeństwem. W planach na przyszłość mam utworzenie ***microservice-notifications*** który z pewnością zrobi użytek z **microservice-email**, ale będzie też korzystał z ***microservice-sms*** oraz ***microservice-push***. To byłaby wersja 1.0.

Mikroserwisy na dole, opisane od lewej do prawej:

* **microservice-memes**: obsługa wrzucania i przechowywania obrazów. Konwersję deleguje do opisanego niżej mikroserwisu.
  * **microservice-image-encoder**: mikroserwis do konwersji obrazów, pisany w Pythonie.
* **microservice-comments**: komentarze. Nie wymaga komentarza.
* **microservice-user-collections**: memy i komentarze można zapisać do ulubionych.

Gdzieś po drodze rozważałem wydzielenie głosów do dedykowanego ***microservice-votes***, ale dla prostoty głosy przechowywane są w **microservice-memes** oraz **microservice-comments**. Być może wydzielę go w wersji 0.2, ale nie dla samego podziału. Chcę, aby UI wyświetlił napis "brak danych" w polu z liczbą głosów, kiedy taki mikroserwis ubiję. Wersja 0.1 tego nie sprawdzi.
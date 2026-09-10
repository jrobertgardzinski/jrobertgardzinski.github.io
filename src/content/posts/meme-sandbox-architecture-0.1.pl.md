---
title: "Piaskownica z memami - architektura wersji 0.1"
date: 2026-09-11
section: it
project: portal
tags: [architektura]
excerpt: "Ogólny zarys architektury mikroserwisowej."
draft: true
---

Większość mikroserwisów tworzona była w Javie, jedynie stuby i enkoder obrazów był pisany w Pythonie. Dlaczego Java? Dojrzały ekosystem, bogactwo narzędzi i skupienie na testach, z których później generowana będzie dokumentacja. Tam gdzie Java to koniecznie stosuję DDD i architekturę heksagonalną lub BCE (Boundary-Control-Entity) w prostszych przypadkach. Przyjąłem zasadę, że mikroserwisy, które nie wymagają pisania jakiejś zawiłej dokumentacji i nie są interesujące dla użytkownika, jak np. kompresja obrazu, będą pisane w pythonie.

## Architektura

![](../image/architecture-0.1.webp)

Na pierwszym planie widać trzy mikroserwisy:

* **core-microservice-security**: generyczny mikroserwis bezpieczeństwa. Pojemnik na przypadki użycia typu: uwierzytelnianie, rejestracja itd. Poniższe mikroserwisy współpracują z nim.
* **microservice-idp**: w środowisku deweloperskim służy jako stub providerów tożsamości takich jak Google czy Github.
* **microservice-saga-offboarding**: orkiestrator sagi usuwania konta. Funkcjonalność umyślnie została wydzielona do osobnego mikroserwisu z uwagi na wiedzę domenową o portalu z memami.

Na prawo od sekcji "security" ustawiony jest **microservice-email**, którego zadaniem jest wysyłanie maili do zatwierdzenia rejestracji konta. To jest jego jedyny cel istnienia. Mógłbym go wciągnąć do sekcji security, ale wysyłanie maili nie ma nic wspólnego z bezpieczeństwem. W planach na przyszłość mam utworzenie ***microservice-notifications*** który z pewnością zrobi użytek z **microservice-email**, ale będzie też korzystał z ***microservice-sms*** oraz ***microservice-push***.

Mikroserwisy na dole, opisane od lewej do prawej:
* **microservice-memes**: obsługa wrzucania i przechowywania obrazów. Optymalizację deleguje do poniższego mikroserwisu.
  * **microservice-image-encoder**: mikroserwis do konwersji obrazów, pisany w Python.
* **microservice-comments**: komentarze. Nie wymaga komentarza.
* **microservice-user-collections**: memy i komentarze można zapisać do ulubionych.

Gdzieś po drodze rozważałem wydzielenie głosów do dedykowanego **microservice-votes**, ale dla prostoty głosy przechowywane są w **microservice-memes** oraz **microservice-comments**. Być może na kolejną wersję 0.2 rozważę ten pomysł.
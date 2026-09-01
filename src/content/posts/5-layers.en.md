---
title: "5 Layers"
date: 2026-09-01
section: it
tags: [architecture]
excerpt: "A way to get rid of services"
draft: false
---
You bump a library to a new major version and something quietly stops working. You patch a CVE that has spread across the whole project. The tests are there, but nobody reads them. There is one cause behind all of it: logic, framework and network sit in the same classes. Below is my split into five layers, shown on the security module from my portfolio - from the domain, which has no idea Spring exists, up to infrastructure, where Spring finally comes in.

## Definitions

1. Domain

Definition: The lowest, pure logical layer, holding value objects that look after their own correctness (they are self-validating).

Role: To define the absolute logical foundations of the system - independent of any external configuration or of the way the application is started.

2. Configuration

Definition: The layer that parameterises the domain rules and makes them flexible.

Role: It turns dynamic or external rules (say, the required password length or special characters) into concrete sets of constraints that are injected into the layers above. How quickly a change takes effect depends on the source (hardcoded, property files and startup arguments, or data from a database or registry).

3. System (small use cases)

Definition: A container for small, usually single-step use cases that tie the Domain to the Configuration - checking a password against the password policy, say, or creating a user object out of an e-mail address and a password.

Role: It supplies ready-made building blocks for the Application layer to use. It does not lay out the business flow itself, does not decide the order of the steps and does not talk to the outside world.

4. Application

Definition: The orchestrating layer - it assembles the blocks from the System layer into complete business scenarios (user registration, Register) and prepares the ground for the framework: repository interfaces and controllers, still without annotations.

Role: It orchestrates the flow - checks the conditions, makes the decisions, sets the order of the steps and delegates the work downwards. It is also the entry point for the application logic: it exposes the same use case in different contexts, translating outside data into the language of the domain.

5. Infrastructure

Definition: The technical and communication layer, turned towards the network and external resources.

Role: It handles receiving and sending data over the network, the database, external APIs and hardware integrations. Together with the application and UI layers it can run the same BDD scenarios, only at the level of network communication. This is where the framework finally shows up - the classes prepared in the Application layer are inherited and given Spring annotations (@Controller, @Repository, @Service).

## Other layers

Past that there is only the Docker container and the UI, the user interface: usually a mobile app or a website. Both have to be kept up to date to keep the vulnerabilities down.

## Testing

Draw the boundaries this way and the notion of a service disappears - and to my mind it should be limited to a Spring annotation anyway. Forget the domain service, the application service and the infrastructure service. What counts here are use cases, covered by BDD tests. So, on to the tests:

* domain, configuration, system: unit tests (JUnit) with an Allure report and the documentation generated from it, plus javadoc to explain the concepts.
* application, infrastructure, UI: BDD (behavior-driven development) with Cucumber - one feature file (Gherkin), and every layer has its own step definitions: the application calls plain code, infrastructure sends an HTTP request, the UI fills in the form and clicks.

BDD scenarios are the high level of abstraction, the one the business reads. The Allure report is the detail under the hood, the one the engineers read.

## Video

GHERKIN EXAMPLE > ALLURE

---
title: "A Sandbox Full of Memes"
date: 2026-08-29
section: it
project: portal
tags: [claude, ai, microservices, kafka, ddd]
excerpt: "I wrote the security service myself over two years. In July an agent built an entire portal around it in two weeks — including a saga that deleted accounts blindly."
draft: false
---

There are three things I can do in this project today: start it, click around, and complain that I'd have done some parts better. Claude writes the code.

This isn't a complaint. It's a summary of a project I started so that I could rebuild, from scratch and after hours, the topics that interest me: distributed transactions, a few flavours of the JVM, observability, preparing for a cluster deployment. In July I lost control of my own sandbox, even though the system stands, runs and has tests.

## Why memes, of all things

Because the domain is trivial. You upload an image, someone comments on it, someone votes. There's no business complexity to untangle here, so all the difficulty lands exactly where I wanted it: in service integration, in the consistency of data scattered across several databases, in deployment.

The choice of broker shows this best. When it came to asynchronous communication, Claude was pushing me towards NATS JetStream — rightly so, because using Kafka for a handful of microservices is like taking a cannon to a sparrow. I insisted on Kafka precisely because this is a sandbox: I want a tool on board that I might meet at work, and I want the door open for adding more consumers. The plans include notifications, auditing, OCR on the memes and a search option over the extracted text. In a production project the agent's argument would have been the better one.

Before I started modelling the domain of memes and comments, I thought it would be wise to take care of security first. Spring has a Security module. A matter of configuration and you're done. I wanted to use the opportunity to try writing my own system instead — all the more so because in one discussion about DDD I found two schools of thought on security: one saying security has nothing to do with DDD, the other saying there's nothing stopping you from using DDD in security. A few evenings were enough for me to understand that DDD does a fantastic job in this area.

I think starting with security has its roots in my professional experience. Twice I worked on large things connected to this subject, so a third attempt struck me as a decent way to atone for my sins.

## Two years in the sandbox

I went back to git so I wouldn't be making things up, and the numbers came out harsher than I remembered.

**June 2024 – August 2025: no assistance at all.**

Thirty-five commits over fourteen months. The result: registration, authentication, session refresh and three layers of the hexagon — domain, application, infrastructure, where:

* domain — business logic, which should model real business problems.
* application — both creating and reading domain objects and calling their methods in order to fulfil a user's request.
* infrastructure — communication with the outside world: web services, databases and other resources.

[source: https://www.hibit.dev/posts/15/domain-driven-design-layers ]

Tellingly, the most frequently repeated phrase in the commit messages from this period is "give up": abandoned Hibernate validation, abandoned events, abandoned records in favour of Lombok.

This stage was crowned with a short video of manual infrastructure testing.

https://youtu.be/nX685z_-UNQ

**September – December 2025: listings pasted into ChatGPT.**

Forty commits. Assistance through the clipboard helps exactly where the problem fits into one file and one question — for me that was password hashing and class naming. The architecture was still being built by hand. That's also when I split the three layers into five, because domain and application aren't enough for me.

* domain,
* config — a specialised domain focused on configuration, e.g. a configurable password policy (password length, a regex for special character requirements, and so on)
* system — a container for use cases: refresh the session;
* application — when system isn't enough and you need an orchestrator of use cases. To register a user, you have to check whether the email is already taken, or whether the password policy has been satisfied. Authentication with brute force protection is a whole other story! The lockout counter: incremented on a failed authentication, or zeroed on a successful login or after setting a time-based authentication lock. It's also good if brute force protection blocks access for 10 minutes the first time, then for 3, to make the bot's job harder. Only somewhere at the very end does the happy ending appear, i.e. a successful login attempt.
* infrastructure

**January – June 2026: Claude Code on the Pro plan.**

That was a leap, but not the one I expected: two hundred and forty-five commits over six months and still **the same three use cases**. I started timidly — rename this class, do a code review — and ended up driving BDD through every layer. January is the only month in the entire history of the project in which I deleted more lines than I wrote. Not a single new feature came out of it. What came out of it was discipline.

Along the way I recorded a video of the progress:

https://youtu.be/_sHEI4u_p5c

## July 2026: 716 commits

I bought Max 20x with one specific intention — to hand the agent the infrastructure layer I couldn't be bothered to hammer out myself. In the course of the conversation it turned out that while we were at it, it would be appropriate to add a few use cases. Then I started commissioning further services built in the image of security. On top of that Fable 5 came back, announced as available "for a week", then for another one, so I started squeezing the maximum out of it before it disappeared.

In thirty days, **716 commits and seventeen new repositories** landed in the repos. For comparison: the entire two years before July came to 320 commits. The densest days were 29 July (146 commits) and 7 July (116). The login service turned into a portal: a gallery, comments, favourite collections, an image encoder, an account deletion saga, and underneath it a shared core — mail, SMS, push, an OIDC stub, offline token verification, an outbox, Kafka, Postgres, MinIO, Prometheus with Grafana and Loki.

The most interesting side effect is that today I have **four JVM frameworks** in a single product:

| service | framework |
|---|---|
| memes, comments | Spring Boot |
| collections, offboarding | Helidon 4 SE |
| mail | Quarkus |
| security | Micronaut |
| image encoder, IdP stub, SMS, push | Python |

I wanted to get to know other frameworks. I know Spring well, and that's exactly why I wanted to see how the same problems are solved elsewhere. Micronaut came first, then Quarkus. Both inject dependencies at compile time, which shortens their startup time compared to Spring, which resolves dependencies at runtime. Then came Helidon, which to this day remains an abstraction to me — I know it works, I don't know how.

## What came out of that pace

**A saga that deleted blindly.** Deleting an account has to pass through five services: memes, comments, collections, security and the orchestrator. The first version shipped on 11 July and looked finished — until I asked what would happen if the third participant refused. The answer: nothing. It deleted everything in sequence, with no compensation and no way back. I had to push hard to get it rebuilt. The "hide first, delete later" rule and the first green run of the compensation tests are dated **8 August** — four weeks after the topic was "done".

**A model living in 2024.** The infrastructure came together quickly and smoothly, only based on tool versions from around the model's cutoff date. The k8s manifests written on 25 July 2026 carried a 2023 baseline from day one. The Maven and npm trees were fresh, because Dependabot was watching those; nobody was watching the images and actions. A commit from 30 July titled "images and actions stop being a souvenir of the model's cutoff date" brought them up to current versions, and Postgres 18 immediately demanded a different volume layout than the one the agent had generated.

| tool | agent generated | after the update |
|---|---|---|
| Postgres | 16-alpine (Sep 2023) | 18-alpine |
| Kafka | 3.9.1 | 4.3.1 |
| MinIO | RELEASE.2024-06-13 | RELEASE.2025-09-07 |
| Grafana | 11.1.0 | 13.1.1 |
| Prometheus | v2.53.0 | v3.13.2 |
| Loki | 3.1.0 | 3.7.4 |
| Tempo | 2.5.0 | 2.9.4 |
| Promtail | 3.1.0 | 3.6.11 |
| node-exporter | v1.8.1 | v1.12.1 |
| cAdvisor | v0.49.1 | v0.55.1 |
| actions/checkout | v4 (141 pins) | v7 |
| setup-java / setup-node / setup-python | v4 / v4 / v5 | v5 / v7 / v7 |

**Almost twenty remediation plans.** When I started running full code reviews with Fable 5 at maximum effort, the model found so much that I had to write it up as separate documents: `PLAN-P10` through `PLAN-P18`, plus an audit of the whole thing and a compensation plan. A single such run ate half a session. Sometimes a review would call into question the fixes from the previous review — and it was right.

**A ratio that says everything.** In July, for every hundred lines added I deleted twenty-one. That's the lowest figure in the entire history of the project — lower than when I was writing everything by hand with no assistance at all. Over six months on Pro that number held at around eighty. In other words: **the assistant didn't make me throw more away. It made seventeen new repositories at once affordable.**

## What this project doesn't have

Because a list of things done, without a list of things not done, is a brochure.

There's no deployment. The k3s manifests are written and verified, but none of it stands on any cluster and I'm not planning to put it there for now. There's no GDPR analysis, and a portal where people create accounts and upload content has no business going out into the world without one. Nor is there — and this one stings the most — my own review of the infrastructure layer. It came about under the agent and I looked at the results, not the code.

In August I dropped down to Max 5x, because on the top plan I caught myself feeling pressure to use up the limits rather than doing what made sense. A cheaper plan forces the question "is this task worth it", and that turned out to be healthy.

## What follows from this

I don't think AI is going to take our jobs. I lean closer to the scientific calculator analogy: it didn't eliminate engineers, it just let them design things that previously weren't worth the arithmetic. It's similar here — with an assistant I can afford a system I would never have written after hours.

But two years of this project taught me something less comforting. **You can delegate the writing. Understanding cannot be delegated.** When in July I handed over both, I got a working product and stopped being its author — and code I don't understand is my debt, not the agent's achievement. The saga that deleted blindly didn't surface in the tests. It surfaced because I asked a question.

So the plan for the coming months is boring and will deliberately stay that way: walk through the infrastructure with my own eyes, close out the review packages, sort out GDPR, and only then think about deployment. No rush, because this is still a sandbox — and from a sandbox I ask one thing: that I learn something in it. The rest can wait.

<p class="mono-comment">// project: 23 repositories, 1118 commits, four JVM frameworks and one owner catching up</p>

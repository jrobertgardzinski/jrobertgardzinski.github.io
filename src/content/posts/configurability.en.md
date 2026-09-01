---
title: "Configurability"
date: 2026-09-01
section: it
tags: [architecture]
excerpt: "Configuration levels seen through their lifecycle"
draft: false
---

In writing on DDD or hexagonal architecture, configuration is rarely addressed head-on. At least not the way I think about it. For this post, take the rule: "after a purchase, the customer has 14 calendar days to report a return". And what if the law changes that deadline to 20 business days?

The answer is: the rule would have to be reworded into something like "after a purchase, the customer has <RETURN_TIME> to report a return". RETURN_TIME would then consist of two values: a number and a unit of time (minutes, hours, calendar days, business days and so on). Depending on where and when the application reads that value, such a change would require:
a) releasing a new version of the software,
b) setting a property in the application.properties file (which would mean restarting the application),
c) changing a setting in the database or on a configuration server - and then there is no need for a new release or a restart.

## Three levels of configuration

On the basis of the above, three levels of configuration can be defined:

Re a) built-in configuration (rebuild config). The value is part of the released version: a constant in the code or a file in the resources (application.properties from src/main/resources, say - that one goes into the jar). The application "reads" it at build time. A change means a commit, a build and a release. Changes are made by a developer. Code review, tests and CI guard against a bad value. 
Example: Period.ofDays(14) in the code.

Re b) startup configuration (restart config). The value lies outside the released version, but the application reads it once, at startup: an application.properties file next to the jar, an environment variable, a JVM parameter. A change means an edit and a restart - no new version. Changes are made by dev-ops. The only protection is the deployment process. 
Example: return.time.amount=20 and return.time.unit=BUSINESS_DAYS in a file next to the application.

Re c) live configuration (live config). The value lies in a source available at runtime - a database or a configuration server - and the application reads it on every use or refreshes it every so often. A change works immediately, with no release and no restart. An administrator or the business can make it from a panel. The only thing that guards it now is whatever the application checks for itself (validation in the constructor). One condition: the application must not read the value once and keep it in memory forever - that is b) in practice, only with a more expensive source.

## All three levels at once

Going for live config with our rule misses the point. Rebuild config would be enough, because regulations like that change rarely and the change is announced far enough in advance. It is not hard, though, to think of rules where all three levels have an important part to play. Take the free delivery threshold.

a) The default value sits in the code: 200 PLN. It changes only with a release, and that is its strength - when everything else fails, the shop still knows the amount above which it ships for free.

b) A competitor announces free shipping from 100 PLN. We do not wait for a release: we add the property shipping.free-from=100 and restart the application - by the evening the shop is already counting the new way. The value in the code stays at 200 PLN until the next release, in which we change the default to 100 as well.

c) On Black Friday the sales manager raises the threshold from the panel to 400 PLN, so that a flood of small orders does not bury the warehouse in parcels - it works from the next order on, with no restart. And when, in a hurry, they type -400 or «four hundred», validation rejects the value and it falls back to the level below: 100 PLN from the restart.

Another example - airlines and the ash cloud from the Icelandic volcano (2010):
a) the compensation amounts from regulation EU261 (250/400/600 EUR),
b) currency, language and procedures per market,
c) waiving the rebooking fees on the affected routes - within an hour, for an indefinite period.

As you can see, at level c), that is live config, the question of an expiry time comes up often. Either someone takes the setting down by hand when they see fit, or an end date does it for them - and once it passes, the value falls back to the level below.

## The precedence ladder

What matters more to me: the precedence ladder. It defines which level wins when the same key is set on several of them at once. The order of the levels, from the lowest to the highest: a), b), c). But higher does not mean "more important". Every level goes through the same constructor: the highest value that passes it wins, an incorrect (or expired) one is skipped and the value falls back to the level below - all the way down to the code, which is always correct.

In the language of the hexagon: the domain receives a ready, correct object through a port. The whole ladder - the levels, the precedence, the validation - is an adapter. The domain does not even know where the value came from.

Live config deserves an asterisk, with the following notes:
1. if the value of the setting is written to the database through a solidly designed system that validates the state of the object as it is created (parse, don't validate), then it is just as safe as any other data the application takes in from outside.
2. if the value lands in the database directly (an UPDATE from a console, a script, another service), it bypasses the gate from point 1 - the database checks only what the schema expresses, and the rest of the rules sit in a constructor that nobody called. Fowler calls such a table an integration database: several parties write to it, so each of them has to enforce the rules on its own, and Newman flatly advises against integrating through a shared database - data is meant to be hidden behind the service that owns it. The result: rows the application cannot parse, instances holding different values in memory, and changes nobody knows about.

## Video

In the video below I present the concept on a simple scenario: the minimum password length when registering a new user. I try to force a minimum of 3 characters, while the code makes sure it never drops below 5. First from the admin panel, and when the system refuses - straight in the database. The incorrect key is skipped with a warning in the log, and the value falls back to the level below.

The scenarios from the video, written in Gherkin: [LINK TO THE FEATURE FILE]

[VIDEO]
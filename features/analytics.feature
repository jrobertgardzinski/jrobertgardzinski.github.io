Feature: Analytics (GoatCounter)
  Traffic is measured with GoatCounter — cookieless, no personal data, so no
  consent banner is needed. Posts additionally show their own visit count, read
  from the public counts endpoint; every failure of that endpoint has to leave
  the meta line clean rather than show a broken number.

  The number is fetched while the site BUILDS and written into the HTML.
  goatcounter.com is on the standard tracker blocklists, so on the browsers that
  block by default — most of the mobile ones — a request made from the page never
  leaves the device, and the counter used to be missing there. The page then
  refreshes the number — never lowering or hiding it — from two sources in order:
  the first-party proxy (wizyty.jrobertgardzinski.pl, invisible to blocklists,
  near-real-time), then goatcounter.com directly (blockable, ~4h cache).

  A post that has been renamed is counted under every address it has ever had;
  that half of the story lives in features/renamed-posts.feature.

  In this suite the build-time counts come from a local stub (tests/build-fixtures.mjs);
  only "Fixture PL 01" and the renamed "Fixture PL 02" have one, so the pages
  below start out without a number unless a scenario says otherwise.

  Note: the browser-side request uses cache:'no-store', because GoatCounter answers
  with headers that allow hours of caching — 404s included. No scenario covers
  that: Playwright intercepts requests before the browser cache is consulted, so
  a stubbed test passes with and without the fix.

  Scenario: The site loads the analytics script
    Given I open the home page
    Then the page has a GoatCounter script for "jrobertgardzinski"

  Scenario: Post pages load it as well
    Given I open the post "hello-world" in language "pl"
    Then the page has a GoatCounter script for "jrobertgardzinski"

  # in these GC-stubbed scenarios the proxy request dies on the abort-everything
  # hook first, so they also prove the proxy -> goatcounter.com fallback
  Scenario: A Polish post shows its visit count
    Given GoatCounter reports "128" visits
    And I open the post "hello-world" in language "pl"
    Then the post view counter shows "128 wizyt"

  Scenario: The Polish plural follows the number
    Given GoatCounter reports "1" visits
    And I open the post "hello-world" in language "pl"
    Then the post view counter shows "1 wizyta"

  Scenario: An English post counts in English
    Given GoatCounter reports "1,234" visits
    And I open the post "hello-world" in language "en"
    Then the post view counter shows "1,234 visits"

  Scenario: No number for this page yet
    Given GoatCounter has no data for this page
    And I open the post "hello-world" in language "pl"
    Then the post meta does not show "wizyt"

  Scenario: The counts endpoint is unreachable
    Given I open the post "hello-world" in language "pl"
    Then the post meta does not show "wizyt"

  # the reason the counter is baked in at all: nothing the page does at runtime
  # can be relied on — this scenario runs with every external host blocked
  Scenario: The count survives a browser that blocks GoatCounter
    Given I open the post "fixture-pl-01" in language "pl"
    Then the post view counter shows "22 wizyty"

  Scenario: A reachable endpoint moves the built-in number forward
    Given GoatCounter reports "128" visits
    And I open the post "fixture-pl-01" in language "pl"
    Then the post view counter shows "128 wizyt"

  Scenario: An endpoint with no number never clears the built-in one
    Given GoatCounter has no data for this page
    And I open the post "fixture-pl-01" in language "pl"
    Then the post view counter shows "22 wizyty"

  Scenario: The first-party proxy feeds the counter
    Given the views proxy reports "128" visits
    And I open the post "hello-world" in language "pl"
    Then the post view counter shows "128 wizyt"

  Scenario: The proxy outranks goatcounter.com
    Given the views proxy reports "128" visits
    And GoatCounter reports "5" visits
    And I open the post "hello-world" in language "pl"
    Then the post view counter shows "128 wizyt"

  # GoatCounter's public endpoint caches for ~4h, so a live source can lag behind
  # the number the build baked in — a refresh must never move the counter backwards
  Scenario: A stale source never lowers the built-in number
    Given the views proxy reports "3" visits
    And I open the post "fixture-pl-01" in language "pl"
    Then the post view counter settles on "22 wizyty"

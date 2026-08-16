Feature: Analytics (GoatCounter)
  Traffic is measured with GoatCounter — cookieless, no personal data,
  so no consent banner is needed. Posts additionally show their own visit
  count (count_unique — repeat reads by one person are one visit), read from
  the public counts endpoint; every failure of that endpoint has to leave the
  meta line clean rather than show a broken number.

  Note: the counter request uses cache:'no-store', because GoatCounter answers
  with headers that allow hours of caching — 404s included. No scenario covers
  that: Playwright intercepts requests before the browser cache is consulted, so
  a stubbed test passes with and without the fix.

  Scenario: The site loads the analytics script
    Given I open the home page
    Then the page has a GoatCounter script for "jrobertgardzinski"

  Scenario: Post pages load it as well
    Given I open the post "hello-world" in language "pl"
    Then the page has a GoatCounter script for "jrobertgardzinski"

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

Feature: Renamed posts
  A post's url is its file name (src/lib/posts.ts), so renaming the file moves
  the post to a new address. Two things then have to be carried over, both
  listed in src/lib/renames.js: the old address has to keep working for links
  and search results, and the visits GoatCounter recorded under it have to keep
  counting — it keys visits by path and knows nothing about the rename, so a
  renamed post otherwise asks about a path the service has never seen, gets a
  404 and quietly loses its counter.

  In this suite "Fixture PL 02" is the renamed post: it lives at
  /wpisy/pl/fixture-pl-02/ and used to live at /wpisy/pl/stary-fixture/, with 5
  visits recorded under the new address and 7 left behind under the old one
  (tests/build-fixtures.mjs).

  GitHub Pages serves static files only, so the redirect is a page with a meta
  refresh, a canonical link to the new address and a noindex — as close to a 301
  as this hosting gets.

  Scenario: The old address still leads to the post
    When I fetch "/wpisy/pl/stary-fixture/"
    Then the response status is 200
    And the response contains "url=/wpisy/pl/fixture-pl-02/"
    And the response contains "https://jrobertgardzinski.pl/wpisy/pl/fixture-pl-02/"

  Scenario: The old address is not offered to search engines
    When I fetch "/wpisy/pl/stary-fixture/"
    Then the response contains "noindex"

  Scenario: The sitemap lists only the current address
    When I fetch "/sitemap-0.xml"
    Then the response contains "/wpisy/pl/fixture-pl-02/"
    And the response does not contain "/wpisy/pl/stary-fixture/"

  # runs with every external host blocked, so this is the number the build baked in
  Scenario: The built-in count covers both addresses
    Given I open the post "fixture-pl-02" in language "pl"
    Then the post view counter shows "12 wizyt"

  Scenario: A refresh from the browser adds up both addresses
    Given GoatCounter reports these visits:
      | path                     | count |
      | /wpisy/pl/fixture-pl-02/ | 100   |
      | /wpisy/pl/stary-fixture/ | 28    |
    And I open the post "fixture-pl-02" in language "pl"
    Then the post view counter shows "128 wizyt"

  Scenario: A post that was never renamed asks about one address only
    Given GoatCounter reports these visits:
      | path                     | count |
      | /wpisy/pl/hello-world/   | 9     |
      | /wpisy/pl/stary-fixture/ | 28    |
    And I open the post "hello-world" in language "pl"
    Then the post view counter shows "9 wizyt"

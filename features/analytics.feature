Feature: Analytics (GoatCounter)
  Traffic is measured with GoatCounter — cookieless, no personal data,
  so no consent banner is needed. Until the owner configures the
  goatcounterCode in src/config.ts, the site must not load ANY
  analytics script.

  Scenario: No analytics script until GoatCounter is configured
    Given I open the home page
    Then the page has no GoatCounter script

  Scenario: Post pages have no analytics script either
    Given I open the post "hello-world" in language "pl"
    Then the page has no GoatCounter script

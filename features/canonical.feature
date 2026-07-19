Feature: Canonical URLs (syndication)
  Every page declares its canonical address, so cross-posts on other
  platforms (dev.to, Medium, …) can point back to the blog as the
  original. A post with `canonicalUrl` in its frontmatter declares an
  EXTERNAL address as the original instead — for content whose home is
  elsewhere.

  Scenario: The home page declares itself as canonical
    Given I open the home page
    Then the canonical URL is "https://jrobertgardzinski.pl/"

  Scenario: A post declares itself as canonical
    Given I open the post "hello-world" in language "pl"
    Then the canonical URL is "https://jrobertgardzinski.pl/wpisy/pl/hello-world/"

  Scenario: A syndicated post points its canonical elsewhere
    Given I open the post "fixture-syndicated" in language "pl"
    Then the canonical URL is "https://example.com/original-article/"

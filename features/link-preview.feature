Feature: Link preview (Open Graph)
  A link pasted into LinkedIn, Slack or a chat turns into a card. Without
  these tags the scraper guesses from the body and shows whatever it finds
  first (the latest recipe as the title, a random excerpt under it).
  The home and about pages introduce the author; a post introduces itself.

  Scenario: The home page presents the author
    Given I open the home page
    Then the link preview title is "Robert Gardziński · Java developer"
    And the link preview description mentions "hexagonal architecture"
    And the link preview image is "https://jrobertgardzinski.pl/og.png"
    And the link preview type is "website"
    And the link preview locale is "en_US"

  Scenario: The about page presents the author
    Given I open the about page
    Then the link preview title is "Robert Gardziński · Java developer"

  Scenario: A post presents itself as an article
    Given I open the post "hello-world" in language "pl"
    Then the link preview title is "Hello World"
    And the link preview description mentions "Pierwszy wpis"
    And the link preview type is "article"
    And the link preview locale is "pl_PL"

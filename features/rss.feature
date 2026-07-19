Feature: RSS feed
  /rss.xml is generated at build time with all published posts
  in both languages; the footer on every page links to it.

  Scenario: rss.xml contains all posts in both languages
    When I fetch "/rss.xml"
    Then the response status is 200
    And the response contains "<rss"
    And the response contains "Hello World"
    And the response contains "/wpisy/pl/hello-world/"
    And the response contains "/wpisy/en/hello-world/"
    And the response does not contain "<language>"

  Scenario: The footer links to RSS
    Given I open the home page
    Then the footer link "rss" points to "/rss.xml"

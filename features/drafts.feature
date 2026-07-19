Feature: Draft posts
  A post with `draft: true` in its frontmatter stays in the repo
  but is not published anywhere: no list entry, no page, no RSS item.
  Publishing = flipping it to `draft: false`.

  Scenario: A draft post is not on the list
    Given I open the home page
    When I search for "Fixture Draft"
    Then I see 0 posts in the list

  Scenario: A draft post has no page
    When I fetch "/wpisy/pl/fixture-draft/"
    Then the response status is 404

  Scenario: A draft post is not in the RSS feed
    When I fetch "/rss.xml"
    Then the response does not contain "Fixture Draft"

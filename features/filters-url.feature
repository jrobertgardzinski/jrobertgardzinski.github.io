Feature: Filter state in the URL
  The list filters are encoded in query parameters
  (?section=&project=&tags=&q=&page=). Going back from a post —
  browser back or the "← wpisy" link — restores the previous filters;
  entering the list from the menu gives a clean slate; filter links are
  shareable. A "wyczyść" button shows up only when any filter is set.

  Scenario: Filters can be preset via URL parameters
    Given I open the home page with query "?section=f1&project=hexagon-demo"
    Then I see 1 post in the list
    And the section chip "F1" is active
    And the project chip "hexagon-demo" is active

  Scenario: Tags can be preset via URL parameters
    Given I open the home page with query "?tags=spring,ddd"
    Then I see 1 post in the list
    And the tag chip "spring" is active

  Scenario: Filtering updates the URL
    Given I open the home page
    When I click the section "F1"
    Then the page address contains "section=f1"

  Scenario: Browser back from a post restores the filters
    Given I open the home page
    When I click the section "IT"
    And I click the post "Hello World"
    And I go back
    Then the section chip "IT" is active

  Scenario: The back-to-list link on a post restores the filters
    Given I open the home page
    When I click the section "IT"
    And I click the post "Hello World"
    And I click the back-to-list link
    Then the section chip "IT" is active

  Scenario: Entering the list from the menu clears the filters
    Given I open the home page with query "?section=f1"
    When I click "wpisy" in the menu
    Then no filter is active
    And I see 4 posts in the list

  Scenario: The clear-filters button appears only when filters are set
    Given I open the home page
    Then the clear-filters button is hidden
    When I click the tag "ddd"
    Then the clear-filters button is visible
    When I click the clear-filters button
    Then no filter is active
    And the clear-filters button is hidden

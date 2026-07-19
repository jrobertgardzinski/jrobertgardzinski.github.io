Feature: Darcula / Light theme
  The nav toggle switches the theme and remembers the choice
  in localStorage. The default theme is dark Darcula.

  Scenario: The default theme is Darcula
    Given I open the home page
    Then the page theme is "dark"
    And the theme button label is "Darcula"

  Scenario: Switching to Light
    Given I open the home page
    When I toggle the theme
    Then the page theme is "light"
    And the theme button label is "Light"

  Scenario: The theme survives a page reload
    Given I open the home page
    When I toggle the theme
    And I reload the page
    Then the page theme is "light"

  Scenario: The favicon follows the theme
    Given I open the home page
    Then the favicon is "/favicon.svg?v=7"
    And the PNG favicon is "/favicon.png?v=7"
    When I toggle the theme
    Then the favicon is "/favicon-light.svg?v=7"
    And the PNG favicon is "/favicon-light.png?v=7"

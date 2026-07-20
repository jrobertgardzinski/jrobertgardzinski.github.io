Feature: Mobile navigation
  On phones the menu collapses into a hamburger button, and the long
  "jRobertGardzinski" wordmark gives way to the compact jRG monogram image
  (theme-aware, same artwork as the favicon). The full wordmark returns on
  the desktop layout.

  Scenario: The menu collapses into a hamburger on a phone
    Given I open the home page on a phone
    Then the hamburger button is visible
    And the menu is hidden
    When I tap the hamburger
    Then the menu is visible
    When I tap the hamburger
    Then the menu is hidden

  Scenario: The toggle button never moves
    Given I open the home page on a phone
    Then the hamburger stays in place when tapped

  Scenario: The brand block stays pinned to the top-left when the menu opens
    Given I open the home page on a phone
    Then the logo stays in place when the menu opens

  Scenario: Settings unfold under the logo when the menu opens
    Given I open the home page on a phone
    Then the theme toggle is hidden
    When I tap the hamburger
    Then the theme toggle is visible
    And the language switch is visible

  Scenario: The logo stays visible when the menu is open
    Given I open the home page on a phone
    When I tap the hamburger
    Then the logo is visible

  Scenario: Desktop shows the full menu without a hamburger
    Given I open the home page
    Then the hamburger button is hidden
    And the menu is visible

  Scenario: Desktop keeps the settings on the right, like the navigation
    Given I open the home page
    Then the theme toggle is visible
    And the theme toggle is on the right half of the screen

  Scenario: The wordmark logo shows on desktop
    Given I open the home page
    Then the wordmark logo is shown
    And the wordmark logo is the "dark" variant

  Scenario: The brand link keeps its accessible name
    Given I open the home page
    Then the brand link is labelled "jRobertGardzinski"

  Scenario: The wordmark becomes the monogram image on a phone
    Given I open the home page on a phone
    Then the logo is shown as the monogram image
    And the wordmark logo is hidden

  Scenario: The monogram image follows the theme
    Given I open the home page on a phone
    Then the monogram image is the "dark" variant
    When I tap the hamburger
    And I toggle the theme
    Then the monogram image is the "light" variant

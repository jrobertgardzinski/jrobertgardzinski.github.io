Feature: Mobile navigation
  On phones the menu collapses into a hamburger button. A regular phone
  (360px, Blackberry-class) still shows the full wordmark; only truly
  narrow screens (QVGA-class, ≤240px) shrink the logo to the jRG monogram.

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

  Scenario: The full wordmark shows on a regular phone
    Given I open the home page on a phone
    Then the logo shows "jRobertGardzinski"

  Scenario: The logo shrinks to jRG on a narrow phone
    Given I open the home page on a narrow phone
    Then the logo shows "jRG"

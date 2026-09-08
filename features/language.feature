Feature: PL|EN language switch
  The segmented control in the nav filters the post list by language
  and remembers the choice in localStorage. A bilingual post (PL/EN)
  is visible in both views.

  # English first: the link travels further than Polish does, and a reader
  # from abroad should land on something they can read (DEFAULT_LANG, i18n.js)
  Scenario: EN is active by default
    Given I open the home page
    Then the active language is "EN"
    And I see only posts in "EN"
    And the result counter shows "14 posts"
    And the featured post label is "latest post · EN"
    And the search placeholder is "search posts…"
    And the menu shows the link "posts"

  Scenario: Switching to PL shows only Polish posts
    Given I open the home page
    When I switch the language to "PL"
    Then I see only posts in "PL"
    And the result counter shows "4 wpisy"
    And the featured post label is "najnowszy wpis · PL"

  Scenario: The language filter persists across pagination
    Given I open the home page
    Then I see only posts in "EN"
    When I go to page 2
    Then I see 2 posts in the list
    And I see only posts in "EN"

  Scenario: The language choice is remembered across pages
    Given I open the home page
    When I switch the language to "PL"
    And I open the about page
    Then the active language is "PL"

  Scenario: The list chrome follows the language
    Given I open the home page
    When I switch the language to "PL"
    Then the search placeholder is "szukaj wpisów…"
    And I see the text "działy:"
    And I see the text "projekty:"
    And I see the text "tagi:"
    When I switch the language to "EN"
    Then the search placeholder is "search posts…"
    And I see the text "sections:"

  Scenario: The post counter uses proper plural forms
    Given I open the home page
    When I switch the language to "PL"
    Then the result counter shows "4 wpisy"
    When I click the section "F1"
    Then the result counter shows "1 wpis"
    When I click the section "F1"
    And I switch the language to "EN"
    Then the result counter shows "14 posts"

  Scenario: Navigation labels follow the language
    Given I open the home page
    When I switch the language to "PL"
    Then the menu shows the link "wpisy"
    And the menu shows the link "o-mnie"
    When I switch the language to "EN"
    Then the menu shows the link "posts"
    And the menu shows the link "about-me"

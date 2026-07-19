Feature: Home page — post list, search and filters
  The post list with search and section/project/tag filters.
  All filters combine with AND; any change resets pagination to page 1.

  Background:
    Given I open the home page

  Scenario: The list shows posts with a counter and a featured post
    Then I see 4 posts in the list
    And the result counter shows "4 wpisy"
    And the featured post is "Hello World"

  Scenario: Search finds a post by title
    When I search for "hello"
    Then I see 1 post in the list

  Scenario: Search with no results shows the empty state
    When I search for "kubernetes"
    Then I see 0 posts in the list
    And the result counter shows "0 wpisów"
    And I see the text "// brak wyników — NoSuchPostException"

  Scenario: Tag filters combine with AND
    When I click the tag "ddd"
    Then I see 2 posts in the list
    When I click the tag "spring"
    Then I see 1 post in the list

  Scenario: Section filter narrows the list
    When I click the section "F1"
    Then I see 1 post in the list

  Scenario: A section with no posts shows the empty state
    When I click the section "majsterkowanie"
    Then I see 0 posts in the list
    And I see the text "// brak wyników — NoSuchPostException"

  Scenario: Empty project and tag rows show a dash
    When I click the section "majsterkowanie"
    Then the projects row shows a dash
    And the tags row shows a dash

  Scenario: Project filter narrows the list
    When I click the project "hexagon-demo"
    Then I see 1 post in the list

  Scenario: Project chips are scoped to the selected section
    When I click the section "F1"
    Then I do not see the project chip "benchmarki"
    And I see the project chip "hexagon-demo"

  Scenario: Tag chips are scoped to the selected section
    When I click the section "F1"
    Then I do not see the tag chip "claude"
    And I see the tag chip "spring"

  Scenario: Deselecting the section brings back all chips
    When I click the section "F1"
    And I click the section "F1"
    Then I see the tag chip "claude"
    And I see the project chip "benchmarki"

  Scenario: An active tag from outside the new section is dropped
    When I click the tag "claude"
    And I click the section "F1"
    Then I see 1 post in the list

  Scenario: Pagination is hidden when everything fits on one page
    Then the pagination is hidden
    And the home footer has no top border

  Scenario: Pagination sits between two horizontal lines
    When I switch the language to "EN"
    Then the pagination is visible
    And the pagination has a bottom border

  Scenario: Pagination appears beyond 12 posts
    When I switch the language to "EN"
    Then the pagination is visible
    And I see 12 posts in the list
    When I go to page 2
    Then I see 2 posts in the list

  Scenario: Changing filters resets pagination to page 1
    When I switch the language to "EN"
    And I go to page 2
    And I search for "fixture"
    Then page 1 is active

  Scenario: Clicking a post title opens the post
    When I click the post "Hello World"
    Then I am on the post "Hello World"
    And the page address contains "/wpisy/pl/hello-world/"

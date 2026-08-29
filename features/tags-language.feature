Feature: Tags follow the language of the post
  Tags are written in the language of the post they belong to, so the tag row
  swaps together with the PL|EN switch: a Polish-only tag is not offered in the
  English view and vice versa. A tag used by posts in both languages (a word
  that does not translate) is neutral and stays in both rows.

  Background:
    Given I open the home page

  Scenario: A Polish-only tag is offered in the Polish view
    Then I see the tag chip "sztuczki"
    And I do not see the tag chip "tricks"

  Scenario: An English-only tag is offered in the English view
    When I switch the language to "EN"
    Then I see the tag chip "tricks"
    And I do not see the tag chip "sztuczki"

  Scenario: A tag shared by both languages stays in both rows
    Then I see the tag chip "claude"
    When I switch the language to "EN"
    Then I see the tag chip "claude"

  Scenario: A Polish-only tag filters the Polish list
    When I click the tag "sztuczki"
    Then I see 1 post in the list
    And the tag chip "sztuczki" is active

  Scenario: An English-only tag filters the English list
    When I switch the language to "EN"
    And I click the tag "tricks"
    Then I see 1 post in the list
    And the tag chip "tricks" is active

  Scenario: Switching the language drops a tag that the new language does not have
    When I click the tag "sztuczki"
    Then I see 1 post in the list
    When I switch the language to "EN"
    Then no filter is active
    And I see 12 posts in the list

  Scenario: A neutral tag survives the language switch
    When I click the tag "claude"
    Then I see 1 post in the list
    When I switch the language to "EN"
    Then the tag chip "claude" is active
    And I see 1 post in the list

  Scenario: Coming back to Polish restores the Polish tags
    When I switch the language to "EN"
    And I switch the language to "PL"
    Then I see the tag chip "sztuczki"
    And I do not see the tag chip "tricks"
    And I see 4 posts in the list

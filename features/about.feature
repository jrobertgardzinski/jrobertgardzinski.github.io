Feature: About page
  The author's page: photo, intro, interest cards and a teaser
  of the newest post.

  Scenario: Header and interest cards
    Given I open the about page
    Then I see the text "Cześć, jestem Robert."
    And I see the card "programowanie"
    And I see the card "f1"
    And I see the card "diy"
    And I see the card "gotowanie"

  Scenario: Newest post teaser
    Given I open the about page
    Then the featured post is "Hello World"

  Scenario: The photo is centered on a phone
    Given I open the about page on a phone
    Then the photo is horizontally centered

  Scenario: The photo lines up with the title on desktop
    Given I open the about page
    Then the photo top lines up with the title

  Scenario: The about page follows the language switch
    Given I open the about page
    When I switch the language to "EN"
    Then I see the text "Hi, I'm Robert."
    And I see the card "programming"
    And I see the card "cooking"
    When I switch the language to "PL"
    Then I see the text "Cześć, jestem Robert."
    And I see the card "programowanie"

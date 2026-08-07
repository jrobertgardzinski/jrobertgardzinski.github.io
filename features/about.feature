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

  Scenario: The photo really loads
    Given I open the about page
    Then the photo is loaded

  Scenario: Clicking the photo opens it enlarged
    Given I open the about page
    Then the enlarged photo is hidden
    When I click the photo
    Then the enlarged photo is visible

  Scenario: Escape closes the enlarged photo
    Given I open the about page
    When I click the photo
    And I press Escape
    Then the enlarged photo is hidden

  Scenario: The close button closes the enlarged photo
    Given I open the about page
    When I click the photo
    And I click the close button
    Then the enlarged photo is hidden

  Scenario: A click beside the photo closes the enlarged photo
    Given I open the about page
    When I click the photo
    And I click the backdrop
    Then the enlarged photo is hidden

  # a modal is a modal: the chrome behind it is inert, so the language switch
  # stays out of reach until the photo is closed
  Scenario: The page behind the enlarged photo is inert
    Given I open the about page
    When I click the photo
    Then the enlarged photo is visible
    And the language switch cannot be clicked

  Scenario: Closing the enlarged photo hands the page back
    Given I open the about page
    When I click the photo
    And I press Escape
    And I switch the language to "EN"
    Then I see the text "Hi, I'm Robert."
    And no enlarged photo is open

  Scenario: The about page follows the language switch
    Given I open the about page
    When I switch the language to "EN"
    Then I see the text "Hi, I'm Robert."
    And I see the card "programming"
    And I see the card "cooking"
    When I switch the language to "PL"
    Then I see the text "Cześć, jestem Robert."
    And I see the card "programowanie"

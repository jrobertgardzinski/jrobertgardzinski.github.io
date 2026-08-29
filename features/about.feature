Feature: About page
  The author's page: photo, intro, profile links and interest cards.

  Scenario: Header and interest cards
    Given I open the about page
    Then I see the text "Cześć, jestem Robert."
    And I see the card "programowanie"
    And I see the card "f1"
    And I see the card "diy"
    And I see the card "gotowanie"

  # the profiles moved out of the footer: they belong to the author, not to every page
  Scenario: Profile links
    Given I open the about page
    Then I see the section heading "// gdzie mnie znaleźć"
    And the profile link "github" points to "https://github.com/jrobertgardzinski"
    And the profile link "youtube" points to "https://www.youtube.com/@robertgardzinski2927"
    And the profile links open in a new tab
    And the footer has no link "github"
    And the footer has no link "linkedin"

  Scenario: The stack the blog runs on
    Given I open the about page
    Then I see the section heading "// blog napędzany przez"
    And the stack lists "hosting" as "github pages" at "https://pages.github.com"
    And the stack lists "domena" as "ovh" at "https://www.ovhcloud.com"
    When I switch the language to "EN"
    Then I see the section heading "// blog powered by"
    And the stack lists "domain" as "ovh" at "https://www.ovhcloud.com"

  Scenario: The stack is one item per line on a phone
    Given I open the about page on a phone
    Then the stack items are stacked vertically

  Scenario: The stack spreads across the width on desktop
    Given I open the about page
    Then the stack items sit side by side

  Scenario: The photo is centered on a phone
    Given I open the about page on a phone
    Then the photo is horizontally centered

  Scenario: The photo sits at the top of the header on desktop
    Given I open the about page
    Then the photo top lines up with the intro

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

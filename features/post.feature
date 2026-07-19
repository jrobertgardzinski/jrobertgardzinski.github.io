Feature: Post page
  A single post: content with code blocks, metadata, comments and
  older/newer navigation. On a bilingual post the PL|EN switch swaps
  the language version; on a monolingual post it shows a notice instead.

  Scenario: A Polish post renders content and metadata
    Given I open the post "hello-world" in language "pl"
    Then I am on the post "Hello World"
    And the post language badge is "PL/EN"
    And I see the code block header "HelloWorld.java"
    And the post content contains "Każdy blog programisty musi zacząć się tak samo"
    And I see the section heading "// komentarze"
    And the footer has a top border

  Scenario: The comments section shows a hint until Disqus is configured
    Given I open the post "hello-world" in language "pl"
    Then I see the text "// Disqus nie skonfigurowany"

  Scenario: The language switch on a bilingual post swaps the content
    Given I open the post "hello-world" in language "pl"
    When I switch the language to "EN"
    Then the page address contains "/wpisy/en/hello-world/"
    And the post content contains "Every developer blog has to start the same way"

  Scenario: Switching to Polish on an English-only post shows a notice
    Given I open the post "fixture-en-01" in language "en"
    When I switch the language to "PL"
    Then the page address contains "/wpisy/en/fixture-en-01/"
    And I see the text "// brak polskiej wersji tego wpisu — NoSuchTranslationException"
    And the active language is "PL"

  Scenario: Switching back to English hides the notice
    Given I open the post "fixture-en-01" in language "en"
    When I switch the language to "PL"
    And I switch the language to "EN"
    Then the notice "// brak polskiej wersji tego wpisu — NoSuchTranslationException" is hidden

  Scenario: A post modified after publication shows the update date
    Given I open the post "fixture-pl-01" in language "pl"
    Then the post meta shows "zaktualizowano 2026-08-02"

  Scenario: A never-modified post shows no update date
    Given I open the post "hello-world" in language "pl"
    Then the post meta does not show "zaktualizowano"

  Scenario: No history link until the repo address is configured
    Given I open the post "hello-world" in language "pl"
    Then there is no history link

  Scenario: The post chrome matches the post language
    Given I open the post "fixture-en-01" in language "en"
    Then I see the text "← posts"
    And I see the section heading "// comments"
    And I see the text "← no older posts"

  Scenario: Older/newer navigation links neighbouring posts
    Given I open the post "hello-world" in language "pl"
    Then I see the text "nowszych wpisów brak →"
    And I see the text "← Fixture Syndicated"

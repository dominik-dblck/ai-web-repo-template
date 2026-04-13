Jasne — poniżej masz wersję **pod bazę wiedzy**: skrócona, ale z zachowaniem całego mięsa informacyjnego.

## Wersja KB

### 1. Kontekst narracyjny

- Mówca przedstawia się jako były scraper, który „nawrócił się”.
- Przez długi czas uważał, że scraping publicznie dostępnych treści nie jest kradzieżą, bo „to przecież jest w internecie”.
- Zmienił zdanie dopiero po pozwie sądowym.
- Główna teza: **publicznie dostępne treści nie są automatycznie wolne do użycia**.

### 2. Jak wyglądał jego scraping w praktyce

- Tworzył boty chodzące po stronach i zbierające dane.
- Zbierał m.in.:
  - ceny produktów ze sklepów internetowych,
  - tytuły i opisy ogłoszeń,
  - treści artykułów do baz wiedzy.

- Początkowo robił to „grzecznie”:
  - w nocy,
  - tak, by nie obciążać serwerów.

- Później działania eskalowały pod potrzeby klientów:
  - zbieranie recenzji z serwisów,
  - kopiowanie treści z blogów konkurencji,
  - pozyskiwanie baz e-mail z LinkedIna.

### 3. Techniki obchodzenia zabezpieczeń

- Rotacja IP przez proxy.
- Fałszywy user-agent.
- Częste podszywanie się pod Googlebota, bo wiele serwisów go nie blokuje.
- Losowe opóźnienia między requestami, żeby ruch wyglądał jak ludzki.
- Headless browser z Puppeteerem, żeby strona „myślała”, że odwiedza ją prawdziwa przeglądarka.
- Skrypty rozwiązujące proste CAPTCHA.
- Mówca był z tych technik dumny, dopóki nie uznał ich za ryzykowne i nieetyczne.

### 4. Dlaczego 2025 był punktem zwrotnym

- Według materiału rok 2025 to moment, w którym scraping przestał być niezauważany.
- Powód: duzi gracze zaczęli pozywać się nawzajem o wykorzystanie treści.

### 5. Przykłady sporów prawnych wymienione w materiale

- **Październik 2025: Reddit vs Perplexity AI**
  - Reddit oskarżył Perplexity o pobieranie treści z Reddita, przetwarzanie ich przez model i serwowanie użytkownikom bez odsyłania do źródła.
  - Reddit określił to jako „bank robbery style scheme”.
  - Argument Reddita: treści mają wartość, są tworzone przez użytkowników, a ktoś inny je bierze i monetyzuje bez umowy.

- **Grudzień 2025: Reddit vs Anthropic**
  - Zarzut: trenowanie Claude na treściach Reddita bez licencji.
  - Materiał podkreśla, że Reddit miał umowy z Google i OpenAI, ale nie z Anthropic.

- **Ziff Davis vs OpenAI**
  - Zarzut nie dotyczył samego scrapingu jako takiego, tylko ignorowania robots.txt.
  - Kluczowy przekaz: robots.txt nie jest „sugestią”, tylko jawnym zakomunikowaniem braku zgody.

### 6. Główna zmiana w argumentacji prawnej

- Materiał podkreśla, że problemem nie jest samo zbieranie danych.
- Problemem jest:
  - scraping bez pytania,
  - ignorowanie zasad właściciela strony,
  - monetyzowanie cudzych treści bez umowy.

- Kluczowe rozróżnienie: **„scraping” vs „scraping po chamsku”**.

### 7. Jak internet zaczął się bronić

- Według materiału:
  - prawie 6 milionów stron blokuje GPTBota,
  - to wzrost o 70% rok do roku,
  - podobna liczba stron blokuje też CloudBota,
  - większe serwisy newsowe, wydawnictwa i portale premium masowo dopisują blokady botów AI do robots.txt.

- Wniosek: internet przestaje być bierny i aktywnie buduje warstwy obrony przed botami AI.

### 8. Aktywne mechanizmy obrony opisane w materiale

#### Cloudflare AI Labyrinth

- Nie blokuje bota od razu.
- Zamiast tego podsuwa mu nieskończony labirynt wygenerowanych stron.
- Strony wyglądają jak prawdziwe treści, ale są bezwartościowe.
- Bot myśli, że skutecznie scrapuje dane, a w praktyce:
  - marnuje tokeny,
  - marnuje czas,
  - marnuje moc obliczeniową,
  - zbiera śmieci.

#### Anubis

- Open source.
- Wykorzystuje proof of work jako barierę wejścia.
- Zanim bot dostanie odpowiedź, musi rozwiązać zagadkę obliczeniową.
- Dla normalnej przeglądarki to mały koszt.
- Dla farmy botów robiącej tysiące requestów na minutę to kosztowe i spowalniające.
- Efekt: masowy scraping przestaje się opłacać.

### 9. Skala ignorowania zasad

- Według materiału około **13% żądań od botów AI** ignoruje zasady właścicieli stron.
- To oznacza, że ponad **1 na 8 prób scrapingu** przez boty AI łamie jawnie wyrażoną wolę właściciela serwisu.
- Interpretacja materiału: część podmiotów świadomie wie, że nie wolno, ale i tak bierze dane.

### 10. Osobisty wniosek mówcy

- Mówca rozpoznał, że robił dokładnie to samo co duże firmy, tylko na mniejszą skalę.
- Według niego różnica między nim a Perplexity nie leży w intencji, tylko w skali.
- Uważa, że prawo nie rozróżnia tego w sposób, który dawałby mu bezpieczeństwo.
- „Nawrócenie” nie wynikało z moralności, tylko z pragmatyzmu:
  - to przestało być bezpieczne,
  - i przestało być konieczne.

### 11. Jak według materiału powinien działać legalny i etyczny scraper

#### Zasada 1: respektowanie robots.txt

- Scraper powinien parsować robots.txt automatycznie jeszcze przed pierwszym requestem.
- Jeśli strona mówi „nie”, to odpowiedź brzmi „nie”.
- Publiczny dostęp nie oznacza zgody na pobieranie i przetwarzanie.

#### Zasada 2: rate limiting

- Minimum wskazane w materiale: około 5 sekund między requestami.
- Cel:
  - nie wyglądać jak DDoS,
  - szanować zasoby serwera,
  - ograniczać koszt po stronie właściciela strony.

#### Zasada 3: uczciwy user-agent

- Koniec z podszywaniem się pod Googlebota.
- Bot powinien identyfikować się prawdziwie.
- Powinien zostawić kontakt.
- Uzasadnienie:
  - właściciel strony powinien wiedzieć, kto go odwiedza,
  - powinien mieć możliwość zgłoszenia problemu,
  - ukrywanie to sygnał, że bot robi coś, czego nie powinien.

#### Zasada 4: flaga ostrzegawcza dla danych osobowych

- Jeśli scraper trafia na dane wyglądające jak:
  - imię,
  - nazwisko,
  - e-mail,
  - numer telefonu,
    to powinien się zatrzymać i zapytać operatora, co robić dalej.

- Materiał podkreśla: takich danych nie wolno zbierać automatycznie bez refleksji.
- Wątek RODO jest wskazany jako realne ryzyko.

### 12. Nowe standardy i kierunki regulacji opisane w materiale

#### ai.txt

- Rozszerzenie idei robots.txt pod kątem AI.
- Pozwala bardziej granularnie określić:
  - co wolno scrapować,
  - czego nie wolno,
  - które sekcje są dozwolone,
  - jakie użycia są akceptowalne.

#### llms.txt

- Deklaracja strony skierowana bezpośrednio do modeli językowych.
- Ma określać:
  - co zawiera strona,
  - jakie są zasady cytowania,
  - czy treści mogą być używane do treningu modeli.

- Według materiału nie jest to jeszcze standard prawny, ale pokazuje kierunek zmian.

### 13. Zmiana ekonomii internetu i scrapingu

- Materiał wskazuje, że internet idzie w stronę monetyzacji dostępu do treści przez AI.
- Wspomniany jest **IAB Tech Lab** i prace nad **Content Monetization Protocols**.
- Idea:
  - jeśli AI chce użyć treści, powinno za nie zapłacić.

- Wspomniany jest też model **pay per crawl** testowany przez Cloudflare:
  - bot może crawlować stronę,
  - ale za każdy request płaci stawkę ustawioną przez właściciela.

- Kierunek zmian:
  - nie „internet za darmo dla botów”,
  - tylko internet z zasadami i cennikiem.

### 14. Co z tego wynika dla narzędzi AI i scraperów

- Sam scraper to za mało.
- Potrzebny jest **feedback kontekstowy**, czyli system, który nie tylko zwraca dane, ale też mówi:
  - czy strona odpowiada normalnie,
  - czy zmieniła strukturę,
  - czy pojawiły się nowe blokady,
  - czy dane wyglądają prawdziwie,
  - czy wyglądają jak honeypot albo śmieci z pułapki typu labirynt.

- Dobry scraper powinien umieć powiedzieć:
  - „coś się zmieniło”,
  - „nie wiem”,
  - „coś jest nie tak”.

- Zły scraper to taki, który milczy i oddaje błędne lub fałszywe dane.

### 15. Ostateczny morał materiału

- Scraping bez zgody, z fałszowaniem tożsamości i ignorowaniem zasad właściciela strony jest przedstawiony jako praktyka niebezpieczna, coraz bardziej ścigana i coraz mniej opłacalna.
- Przyszłość należy do scraperów i agentów, które:
  - respektują reguły właścicieli treści,
  - działają transparentnie,
  - mają rate limiting,
  - reagują na zmianę środowiska,
  - wykrywają podejrzane odpowiedzi,
  - i potrafią przerwać działanie zamiast zwracać śmieci.

- Na końcu mówca deklaruje, że idzie wyłączyć stare skrypty z fałszywym user-agentem.

Jeśli chcesz, mogę od razu przerobić to jeszcze na **ultra-czysty format JSON / YAML / markdown facts**, taki już totalnie pod RAG albo bazę wiedzy bez żadnej narracji.

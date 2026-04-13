Cześć!
_00:00_

Dzisiaj mam dla Ciebie historię, która jest bardziej powszechna niż ktokolwiek chciałby przyznać.
_00:00_

Wyobraź sobie typowe polskie biuro, takie Anno Domini 2026, które uwielbia korzystać z przeróżnych dobrodziejstw.
_00:06_

Zespół buduje workflow i codziennie rano ściąga wiadomości ze Slacka, przepuszcza je przez LLM-a, generuje podsumowanie i wysyła na kanał menadżerski.
_00:14_

Przez miesiąc działa idealnie.
_00:24_

Dzień 31.
_00:27_

OpenAI podnosi minimalne limity tokenów na modelu, który Workflow używa.
_00:28_

Workflow nie craszuje, bo to by było za łatwe.
_00:33_

Workflow dalej działa.
_00:37_

Tylko, że podsumowania są teraz krótsze, bo model obcina kontekst.
_00:39_

Nikt nie zauważa, bo podsumowania wyglądają normalnie, po prostu pomijają część wątków.
_00:43_

Po dwóch tygodniach ktoś pyta, czemu nie było nic o projekcie Omega?
_00:50_

Odpowiedź, bo workflow od dwóch tygodni generuje niepełne dane.
_00:55_

14 dni utraconych informacji.
_00:59_

Nic się nie wysypało, tylko po prostu po cichu zdegradowało.
_01:02_

To jest problem numer jeden w workflowach z AI.
_01:07_

Cicha degradacja.
_01:10_

I dzisiaj pokażę ci cztery wzorce, które przed tym chronią.
_01:11_

Workflow oparty o modele językowe to zupełnie coś innego niż klasyczny skrypt.
_01:20_

W skrypcie masz tane wejściowe.
_01:25_

Logikę i dane wyjściowe.
_01:28_

Jeżeli coś się psuje, to dostajesz errora z Tag Tracea i wiesz, gdzie szukać.
_01:31_

W Workflow AI masz dane wejściowe, wywołanie zewnętrznego API, które kosztuje pieniądze, zwraca niedeterministyczne wyniki, ma zmienną latencję od.
_01:35_

200 milisekund do minuty, i może się udać w sensie technicznym, ale zwrócić kompletny śmieć merytorycznie.
_01:45_

.
_01:45_

To jest ta różnica, na którą warto zwrócić uwagę.
_01:53_

W klasycznym skrypcie porażka jest binarna, bo działa
_01:56_

Albo nie działa.
_02:00_

W Workflow AI porażka jest w pewnym sensie spektrum i najtrudniejsze do wykrycia są porażki bliskie sukcesu.
_02:01_

Mark Brucker, Distinguished Engineer of AWSie, w swoim artykule o back-offie i giterze postawił sprawę jasno: W systemach rozproszonych nie pytasz, czy coś się zepsuje, tylko kiedy i jak zareagujesz.
_02:10_

I pragnę na marginesie tylko zwrócić uwagę na datę w artykule.
_02:24_

Rok 2015, jeszcze przed tym całym AI-em.
_02:29_

Workflow AI to system rozproszony z dodatkową warstwą nieprzewidywalności.
_02:33_

I właśnie dlatego potrzebuje wzorców odporności, które w inżynierii oprogramowania istnieją od dekad.
_02:38_

Ale w kontekście AI wymagają adaptacji.
_02:45_

Zacznijmy od najprostszego.
_02:48_

Wywołanie API nie poszło.
_02:50_

No to spróbuj jeszcze raz.
_02:52_

Brzmi trywialnie, ale naiwne retry to recepta na katastrofę.
_02:54_

Jeżeli 10 tysięcy twoich workflowów jednocześnie dostanie time outa.
_02:59_

I natychmiast ponowi próbę, no to właśnie zrobiłeś Didos'a na własnego prowidera.
_03:03_

To się nazywa Thundering Heart, czyli takie grzmiące stado.
_03:09_

Nie wiem, jak to można inaczej przetłumaczyć, i jest jednym z najczęstszych problemów w systemach rozproszonych.
_03:13_

Sam byłem świadkiem położenia w ten sposób pewnych instytucji.
_03:19_

Rozwiązanie!
_03:22_

Exponential back of.
_03:23_

Pierwsza próba po jednej sekundzie.
_03:25_

Druga po dwóch.
_03:27_

Trzecia po czterech, czwarta po ośmiu.
_03:29_

Ale.
_03:32_

Sambakow nie wystarczy, bo jeżeli wszystkie twoje instancje startują z tym samym opóźnieniem, no to to Ritra jest synchronizowane, więc wracamy do Thundering Heard.
_03:32_

Tylko przesuniętego w czasie.
_03:44_

Dlatego dodajesz jiter, czyli losowe odchylenie od tego bazowego czasu.
_03:46_

Bruker w artykule z bloga AWS Architecture pokazał, że tak zwany decorrelated jitter, gdzie każda kolejna próba losuje czas z rosnącego zakresu
_03:51_

Redukuje liczbę kolizji orząd wielkości w porównaniu z prostym backowem.
_04:02_

W kontekście AID jest jeszcze jeden nians.
_04:06_

Ritrai kosztuje każde ponowione wywołanie LLM-a to kolejne tokeny, kolejne pieniądze.
_04:10_

Dlatego zanim ponowisz, sprawdź, czy warto.
_04:16_

Timeout po 30 sekundach
_04:19_

Tak, ponów, błąd 400B request?
_04:22_

Eeeh, nie no, twój prompt jest zły i ponowienie nic nie zmieni.
_04:25_

Błąd 429, rate limit.
_04:30_

ale z dłuższym back offem.
_04:33_

Rozróżnianie typów błędów przed decyzją Retry to zdecydowana konieczność.
_04:35_

RetRay rozwiązuje przejściowe awarie, ale co jeśli API jest po prostu niedostępne?
_04:40_

Ponawianie w nieskończoność to marnotrawienie zasobów i pieniędzy.
_04:46_

Tu wchodzi Circuit Breaker, czyli wzorzec, który Martin Fowler opisał ponad dekadę temu, a który w kontekście Workflow AI.
_04:50_

nabiera nowego znaczenia.
_04:58_

Circuit Breaker działa jak bezpiecznik elektryczny, ma trzy stany, stan zamknięty, gdzie wszystko działa normalnie.
_04:59_

Żądania przechodzą.
_05:07_

Jeżeli w oknie 10 ostatnich wywołań.
_05:08_

5 się nie powiedzie, to bezpiecznik przeskakuje na stan otwarty.
_05:11_

W stanie otwartym żadne requesty nie przechodzą.
_05:16_

Workflow natychmiast dostaje informację, usługa niedostępna bez czekania na timeout.
_05:19_

Po ustalonym czasie, powiedzmy 60 sekundach, bezpiecznik przechodzi w stan półotwarty, przepuszcza jedno.
_05:24_

.
_05:32_

Próbne wywołanie.
_05:32_

Jeżeli się uda, to wraca do stanu zamkniętego.
_05:34_

Jeżeli nie, to znów przechodzi w stan otwarty.
_05:37_

A dlaczego to jest krytyczne w Workflow AI?
_05:39_

Bo OpenAI czy Antropik, każdy z prowajderów, miał w ciągu ostatniego roku incydenty trwające od kilku minut?
_05:42_

Dokumentacja OpenAI wprost mówi o rate limitach, które mogą się zmieniać dynamicznie w zależności od obciążenia.
_05:51_

Bez circuit breakera.
_05:58_

Twój workflow w trakcie takiego incydentu spala tokeny na requesty, które i tak nigdy się nie powiodą, generują lawinę time-outów, a w najgorszym przypadku blokują inne procesy czekające na wynik.
_06:00_

Ale jedna ważna uwaga.
_06:13_

W Workflow AI musisz zdefiniować, co oznacza failure w kontekście Circuit Breakera.
_06:14_

W przypadku time-outu jest to jasne.
_06:20_

HTTP500?
_06:23_

Też jasne.
_06:25_

Ale co z odpowiedzią, która przyszła w 3 sekundy, ma status 200, ale zawiera halucynację?
_06:26_

To jest granica, na której klasyczne wzorce do odporności spotykają się z problemami specyficznymi dla AI.
_06:32_

I tu wchodzimy w walidację odputu, o której za chwilę.
_06:39_

Retry nie pomógł.
_06:42_

Circuit breaker się otworzył.
_06:44_

Co z danymi, które miały być przetworzone?
_06:46_

Jeżeli twoja odpowiedź brzmi trudno.
_06:48_

Spróbujemy jutro, no to pracujesz z systemem, który gubi dane.
_06:51_

A jeżeli te dane to faktury klientów, zgłoszenia saportowe albo krytyczne alerty, to gubienie jest niedopuszczalne.
_06:55_

Dead Letter Q to wzorzec, w którym każde zadanie, które nie przeszło przetwarzania po wyczerpaniu retrice, trafia do osobnej kolejki.
_07:04_

Nie znika.
_07:14_

Czeka, może być przetworzone później automatycznie, gdy tylko usługa wróci.
_07:15_

Może być przejrzane ręcznie, może wygenerować alert.
_07:21_

W najprostszej implementacji DLQ to tabela w bazie danych.
_07:25_

Kolumny, timestamp, payload wejściowy, typ błędu, liczba prób i status.
_07:29_

Nie potrzeba tu jakiejś ewilibrystyki.
_07:35_

To prosta inżynieria.
_07:37_

Ale ta prosta tabela oznacza różnicę pomiędzy straciliśmy dane z 7 dni, a mamy kolejkę 7 dni do przetworzenia.
_07:39_

W pierwszym scenariuszu można spanikować, bo ten tydzień danych wejściowych no skąd trzeba wziąć, najczęściej ręcznie coś przeglądając i je organizując.
_07:48_

W drugim.
_07:57_

Odpalamy reprocessing i idziemy na kawę.
_07:58_

Google w swoim SRI Book, który jest dostępny za darmo online, poświęca całą sekcję na obsługę przeciążeń i kolejkowanie zadań.
_08:01_

Zasada jest prosta.
_08:08_

Jeżeli system nie jest w stanie przetworzyć danych w czasie rzeczywistym, musi je zachować do przetworzenia później.
_08:10_

Alternatywa to utrata danych, która jest zawsze droższa niż koszt utrzymania takiej kolejki.
_08:16_

I tu wracamy do historii z początku.
_08:22_

Tamten workflow miał retry, miał nawet jakiś circuit breaker, ale nie miał jednej rzeczy.
_08:25_

Nikogo, kto by sprawdził, czy wynik ma sens.
_08:32_

Monitoring Workflow AI to sprawdzenie, czy wynik jest poprawny.
_08:35_

I to jest drobna różnica w porównaniu z klasycznym monitoringiem.
_08:40_

W tradycyjnej aplikacji monitorujesz, czy serwer odpowiada, jaka jest latencja, ile jest błędów na minutę.
_08:44_

W Workshow AI
_08:50_

Musisz dodatkowo monitorować jakość odputu.
_08:51_

Co konkretnie monitorować?
_08:55_

Po pierwsze zgodność ze schematem
_08:57_

Jeżeli oczekujesz JSona z polami Samary, Topics i Action Items, to waliduj, czy te pola istnieją i nie są puste.
_08:59_

Brzmi banalnie, ale łapię większość degradacji.
_09:07_

Po drugie, długość i proporcje.
_09:11_

Jeżeli podsumowanie zwykle ma 300 tokenów, a nagle ma 50, no to jest to czerwona flaga.
_09:14_

Po trzecie, kanarki, czyli Canary Checks.
_09:21_

Periodycznie wysyłaj znane dane testowe przez Workflow i sprawdzaj, czy wynik jest akceptowalny.
_09:24_

To jest taki twój smoke-test działający na produkcji.
_09:31_

Ale w odróżnieniu od kanarków w kopalniach, nie wymaga poświęcania ich życia.
_09:34_

Alert powinien wyjść nie po godzinie, nie po dniu, ale po pięciu minutach od pierwszego wyniku będącego anomalią.
_09:39_

Bo każda minuta cichej degradacji to dane, które albo są złe, albo nie istnieją.
_09:47_

Masz cztery wzorce: nie musisz wdrażać wszystkich naraz.
_09:53_

To nie jest czeklista do odfajkowania w jeden sprint.
_09:56_

To jest porządek priorytetów.
_10:00_

Zacznij od retry z back-offem i monitoringu.
_10:02_

Te dwa wzorce razem mają najwyższy zwrot inwestycji.
_10:05_

Retry obsługuje 80% przejściowych problemów.
_10:09_

Monitoring mówi ci, kiedy Retry nie wystarczy.
_10:12_

Dodaj Circuit Breaker, gdy masz wiele zewnętrznych zależności.
_10:15_

Jeżeli Twój workflow woła trzy różne API LLMa, bazę wektorową i CRMa, to Circuit Breaker na każdym z nich chroni przed kaskadą.
_10:19_

Jedna usługa padła, reszta workflow dalej działa z Graceful Degradation.
_10:29_

Dodaj DLQ, gdy przetwarzasz dane biznesowo-krytyczne, e-maile klientów, dokumenty finansowe, pipeline analityczny, wszystko!
_10:33_

czego utrata oznacza realny koszt.
_10:42_

Powinno mieć kolejkę rezerwową.
_10:45_

I jedna rzecz na koniec.
_10:47_

Te wzorce nie są specyficzne dla AI.
_10:49_

I istnieją w inżynierii oprogramowania od lat, ale w kontekście Workflow AI nabierają nowego znaczenia, bo model językowy dodaje warstwę nieprzewidywalności, której nie ma w klasycznym API.
_10:52_

Model może odpowiedzieć poprawnie technicznie, ale źle merytorycznie.
_11:05_

Model może zwrócić inny wynik dla identycznego promptu.
_11:09_

Model może działać wolniej o rząd wielkości bez żadnego ostrzeżenia.
_11:13_

Dlatego buduj workflow tak, jakby każde zewnętrzne wywołanie mogło zawieść.
_11:18_

Bo prędzej czy później, zawiedzie.
_11:24_

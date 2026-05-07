# PRD — Rezervační formulář Cobra & Informace

## 1. Kontext a problém

Cobra (bar) a Informace (výčep) jsou dva propojené podniky vzdálené ~10 metrů; produkty se mezi nimi přenášejí. Cobra je starší a známější, Informace menší a praktičtější pro některé skupiny.

Pro malé rezervace (do 10 lidí) běží **rezervujstul.cz**. Pro větší rezervace zákazníci píší e-mail — a v něm pravidelně chybí klíčové údaje:

- telefon
- konkrétní čas
- **který z podniků** chtějí rezervovat (mnoho lidí netuší, že jeden e-mail patří dvěma podnikům)

Cíl: nahradit "napište nám e-mail" strukturovaným formulářem, který:

1. Vynutí kompletní informace (žádné chybějící údaje).
2. Pomůže zákazníkovi vybrat správný podnik.
3. Umožní upsell cateringu interaktivně přímo ve formuláři.

## 2. Cíle a non-cíle

### Cíle (v1)
- Strukturovaný formulář pro rezervace **10–35 lidí** (primárně narozeninové oslavy).
- Volba mezi Cobrou a Informacemi se srozumitelným vodítkem.
- Interaktivní výběr cateringu s živou kalkulací ceny.
- Po odeslání: e-mail provozovateli + kopie zákazníkovi.
- Sekundárně: jednoduchá "poptávková" varianta pro velké uzavřené společnosti (50+ lidí), která sbírá základní info a slibuje individuální komunikaci.

### Non-cíle (v1)
- Žádná integrace s rezervujstul.cz.
- Žádné blokování termínů / kontrola obsazenosti — konflikty řeší provozovatel ručně.
- Žádná platební brána ani záloha — vše se platí na místě.
- Žádný admin dashboard / databáze rezervací — vše chodí jen e-mailem.
- Anglická jazyková verze přijde až ve v2.

## 3. Uživatelé

### Zákazník (host)
- Typicky organizátor narozeninové oslavy pro 10–35 lidí.
- Chce rychle zjistit: "Vejdu se? Bude to stát kolik? Kdy se ozvete?"
- Mobilní zařízení převažují — formulář musí být responzivní a krátký.

### Provozovatel (Kateřina)
- Dostává e-mail s kompletním shrnutím rezervace.
- Vyhodnocuje dostupnost ručně, odpovídá z vlastní mailové schránky.
- Žádné další osoby v procesu.

## 4. Kapacity a charakter podniků

### Kapacity

| Podnik       | Běžný provoz | Uzavřená společnost |
|--------------|--------------|---------------------|
| Cobra        | 15–20 lidí   | až 100 lidí         |
| Informace    | do 20 lidí   | do 30 lidí          |

**Strop celkem:** 100 lidí (Cobra uzavřená). Nad 100 v1 nepřijímáme.

### Charakter — co kde najdete

Tento popis slouží dvěma účelům: (1) PRD kontext pro logiku doporučení podniku, (2) **přímé copy do formuláře** — host musí tuto informaci vidět při výběru podniku, ideálně jako rozbalovací "Co je co?" panel nebo karty u radio buttonů.

**Cobra (cocktailový bar)**
- Široká nabídka koktejlů včetně **signature menu**.
- Standardní výběr piv, vín a destilátů.
- Kuchyně podniku — lze si zde objednat plnohodnotnou večeři.

**Informace (výčep)**
- **Větší výběr piv** než v Cobře.
- Základní výběr vín, koktejlů a destilátů.
- **Samoobslužná sekce** s malými jídly (drobné občerstvení k pivu).
- Z Informací si lze **objednat večeři z Cobry** (díky propojení podniků).

### Praktický důsledek pro výběr
- Hosté se zájmem o **koktejly / signature drinky** → Cobra.
- Hosté se zájmem o **pivo + neformální atmosféru** → Informace.
- Velké skupiny (~25+) bez důrazu na koktejly → Informace bývá praktičtější (stejně si jídlo z Cobry mohou objednat).
- Velké skupiny 30+ s pivním nebo cateringovým profilem, kde Informace nestačí kapacitou → Cobra uzavřená společnost.

## 5. Hlavní formulář — pole

### Krok 1: Základ
- **Datum** — date picker; minimálně "zítra".
- **Čas začátku** — výběr z 14:00–20:30 (po 30 minutách).
- **Počet lidí** — číslo, 10–100.
- **Podnik** — radio / segmented control:
  - Cobra (cocktailový bar)
  - Informace (výčep)
  - "Nejsem si jistý/á, doporučte mi"

### Logika doporučení podniku
Když host vybere "Nejsem si jistý" nebo Cobru se 30+ lidmi bez důrazu na koktejlové menu (viz krok 2), formulář ukáže nenásilný hint:

> *Pro skupiny nad 25 lidí, kde není hlavní zájem koktejlové menu, většinou doporučujeme Informace — je to praktičtější pro větší partu. Cobra je ideální, pokud chcete plné koktejlové menu nebo signature drinky.*

Volba je vždy na zákazníkovi, jen ho navedeme.

### Krok 2: Charakter akce (krátký)
- **Typ akce** — narozeniny / sraz / firemní / jiné (textové pole).
- **Důležité je pro mě:** (multi-select, slouží k logice doporučení podniku)
  - Koktejlové menu / signature drinky
  - Jídlo / catering
  - Klidné prostředí
  - Žádné preference

### Krok 3: Catering (volitelný, ale prominentní)
Sekce s nadpisem typu **"Chcete to pohostit? Sestavte si raut."** s "košíkem" — viz §6.

### Krok 4: Kontakt a poznámka
- **Jméno a příjmení** — povinné.
- **Telefon** — povinné, validace formátu.
- **E-mail** — povinné, validace formátu.
- **Poznámka** — volitelná (alergie, výzdoba, hudba, dort vlastní…).
- **Souhlas se zpracováním osobních údajů** — povinný checkbox (GDPR).

## 6. Catering builder

### Princip
Interaktivní seznam položek, kde si zákazník naklikává množství a vidí živý součet.

### Zdroj dat — Google Sheet

Catering menu a ceny **musí být snadno editovatelné bez zásahu do kódu**. Stejný princip, jakým běží stávající web — data se tahají z Google Sheetu, který slouží jako single source of truth.

**Implikace:**
- Aplikace čte data z Google Sheetu při loadu formuláře (nebo s krátkou cache, např. 5 min).
- Provozovatel může kdykoli upravit ceny / přidat / odebrat položku ve sheetu — projeví se na webu bez deploye.
- Sheet má pevně danou strukturu sloupců, kterou frontend zná (viz níže).
- Při výpadku / chybě Sheet API: formulář ukáže fallback hlášku "Catering momentálně načítáme jinak — napište nám prosím požadavky do poznámky." a sekci skryje, ale zbytek formuláře funguje.

**Navrhovaná struktura sheetu** (jeden řádek = jedna položka):

| sloupec | typ | příklad |
|---|---|---|
| `id` | string | `rizecky` |
| `kategorie` | enum | `slane_hlavni` / `kanapky` / `misy` / `dort` |
| `nazev` | string | "Kuřecí mini řízečky & kyselé okurky" |
| `popis` | string (volitelný) | krátký dovětek |
| `jednotka` | string | "1 kg", "1 ks", "porce", "12 lidí" |
| `cena` | number / "individualne" | `950` |
| `min_pocet` | number (volitelné) | `5` (pro kanapky) |
| `varianty` | string (volitelné, oddělené čárkou) | "vanilkový, kakaový, pistáciový" (dort) |
| `aktivni` | boolean | TRUE/FALSE — jednoduchý on/off bez mazání řádku |

Stejný princip lze později použít i pro **krátké texty u podniků** (Cobra/Informace popis), aby šly editovat přes sheet, ne přes kód.

### Položky (aktuální stav — viz `catering-polozky.csv`, finální zdroj bude Google Sheet)

**Slané hlavní:**
| Položka | Jednotka | Cena |
|---|---|---|
| Kuřecí mini řízečky & kyselé okurky | 1 kg | 950 Kč |
| Hovězí tatarák & topinky z kváskového chleba | 500 g | 650 Kč |
| Carpaccio se sýrem parmigiano reggiano, rukola, citron & focaccia | 110 g | 320 Kč |
| Salát z krevet, brambor a sušených rajčat & focaccia | 1 kg | 950 Kč |

**Kanapky (min. 5 ks od jednoho druhu, lze kombinovat):**
| Položka | Cena/ks |
|---|---|
| Pražská šunka, smetanový křen, cornichon, kváskový chléb | 55 Kč |
| Marinovaný lilek, focaccia, oliva | 55 Kč |
| Vajíčková pomazánka s lanýžovou majonézou, focaccia, pažitka | 65 Kč |
| Kanapky s baba ganoush / hummus / muhammara | 55 Kč |
| Tatarák ze sušených rajčat na topince | 75 Kč |
| Letní závitek s krevetou | 105 Kč |
| Letní závitek s tofu, zeleninou a omeletou | 90 Kč |
| Focaccia s muhammarou, halloumi & granátovým jablkem | 80 Kč |
| Kanapky s focacciou, muhammarou a grilovaným halloumi | 85 Kč |
| Pizza šnek se šunkou a sýrem | 55 Kč |

**Mísy a doplňky:**
| Položka | Jednotka | Cena |
|---|---|---|
| Marinované olivy a sušená rajčata (vegan) | porce | 135 Kč |
| Zeleninové crudités s hummusem/babaganoushem/muhammarou & focaccia | porce | 155 Kč |
| Mísa evropských sýrů a hroznové víno | dle rozpočtu | individuálně |
| Mísa uzenin, nakládaná zelenina, hrubozrnná hořčice | dle rozpočtu | individuálně |

**Dort:**
| Položka | Pro | Cena |
|---|---|---|
| Dort pro 12 lidí (3 varianty: vanilkový mascarpone s lesním ovocem / kakaový s karamelem a čokoládou / pistáciový s bílou čokoládou) | 12 lidí | 1 650 Kč |

### Chování builderu
- Pro každou položku: tlačítka **−/+** nebo input s počtem.
- U kanapek: validace minimum 5 ks od druhu (pokud > 0, pak ≥ 5).
- Položky "dle rozpočtu" (sýrová mísa, mísa uzenin): textový input "Kolik bych chtěl/a utratit (Kč)" → přidá se do součtu jako odhadovaná částka, ne pevná cena. Vedle pole věta: *"Množství upravíme podle rozpočtu."*
- U dortu: select varianty (vanilkový / kakaový / pistáciový), pak +/− kusů.
- **Živý součet** ceny dole, sticky na mobilu.
- **Lead time pro catering: ≥ 3 dny.** Když host vybere catering a datum < 3 dny, ukáž varování:

  > *Pro catering potřebujeme alespoň 3 dny dopředu. Bez cateringu rezervaci přijímáme i na zítřek — můžeme ho s vámi probrat individuálně, pokud vám tento termín vyhovuje.*

- Tlačítko **"Catering nechci, jen rezervaci"** přeskočí celou sekci.

## 7. Flow po odeslání

1. Validace na klientovi → odeslání.
2. **E-mail provozovateli** s kompletním shrnutím:
   - Jméno, telefon, e-mail
   - Datum, čas, počet lidí, podnik
   - Typ akce, preference
   - Položky cateringu + součet
   - Poznámka
3. **E-mail zákazníkovi** (kopie) s textem:
   > *Děkujeme za rezervaci. Ozveme se vám do 24 hodin s potvrzením. Níže najdete shrnutí toho, co jste vyplnili.*
   + identické shrnutí.
4. Na webu: stránka "Děkujeme, ozveme se do 24 hodin."
5. Provozovatel ručně odpoví z vlastního e-mailu — potvrzení nebo úprava (žádný systém na to není potřeba).

## 8. Sekundární formulář — velká uzavřená společnost (50+ lidí)

Pokud host v hlavním formuláři zadá počet lidí > 35 (nebo klikne na tlačítko "Větší akce / firemní event"), zobrazí se kratší poptávkový formulář:

- Jméno, telefon, e-mail
- Předpokládaný počet lidí
- Předpokládané datum (může být přibližné)
- Typ akce
- Volný textový popis představy
- Souhlas se zpracováním osobních údajů

Bez cateringu builderu — vše se řeší individuálně po telefonu / mailu / osobní schůzce.

## 9. Provozní pravidla

| Pravidlo | Hodnota |
|---|---|
| Min. lead time rezervace | následující den |
| Min. lead time catering | 3 dny |
| Časový rozsah začátku rezervace | 14:00–20:30 |
| Min. počet lidí pro hlavní formulář | 10 |
| Max. počet lidí pro hlavní formulář | 35 (nad → poptávkový formulář) |
| Max. kapacita celkem (celý systém) | 100 (Cobra uzavřená) |

## 10. Technické poznámky

- **Stack:** vibecoding s Claude. Web se předělává, formulář může být buď embed do nového webu, nebo samostatná stránka odkazovaná z webu.
- **Design:** zatím agnostický — čistý, mobile-first, ladí s budoucím novým brandem (až bude hotový, doplníme barvy/font).
- **Jazyk v1:** čeština. Struktura připravená na pozdější doplnění angličtiny (i18n od začátku, ať se nepřepisuje).
- **Spam ochrana:** honeypot pole + jednoduchý hCaptcha / Cloudflare Turnstile.
- **Data:** žádná databáze v1. Stav žije v e-mailové schránce provozovatele.
- **GDPR:** povinný checkbox + krátký link na zásady zpracování OÚ. V e-mailu zákazníkovi info o tom, kdo data zpracovává.

## 11. Otevřené budoucí rozšíření (v2+)

- Anglická verze.
- Integrace s rezervujstul.cz nebo vlastní kontrola obsazenosti / blokace termínů.
- Admin dashboard místo čistě e-mailového flow (až objem žádostí poroste).
- Online záloha / platební brána pro velké akce.
- Sdílený Google Calendar pro Cobru a Informace s automatickým zápisem potvrzených rezervací.

---

## 12. Otázky k dořešení před stavbou

- Přesný text/copy hintů (doporučení podniku, varování o lead time atd.) — finalizovat při implementaci.
- E-mailová adresa, kam se posílají rezervace.
- Adresa odesílatele auto-reply mailu (potřeba SMTP / služba typu Resend / Postmark).
- Doména a hosting (až bude jasná podoba nového webu).

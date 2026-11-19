# Mobiele leesbaarheid en paginalengte - 19 november 2026

Gebruikersfeedback: overlap, te veel scrollen en een glitchend balkje bovenaan.

De oranje balk was een decoratieve CSS-scrollindicator, geen laadstatus. Die is
verwijderd, inclusief de scroll-timeline-animatie. De mobiele H1 had 0,96 regelhoogte
en een onderstreping die de volgende regel raakte. Mobiele koppen hebben nu meer
regelafstand, een kleinere schaal en geen onderstreping in de H1.

Op de mobiele homepage staan nu vier voorbeeldfoto's. Een knop opent alle 16
projectfoto's in de bestaande viewer; de volledige projectpagina behoudt de
galerij. Alle originele HTML, foto-adressen en directe fotokoppelingen blijven.
Van de 20 voorwaardenartikelen staan mobiel de eerste drie direct op de homepage,
met een link naar de volledige voorwaardenpagina. Een rechtstreeks geopend
artikel blijft zichtbaar en wordt onder de navigatie geplaatst.

Verder: minder sectiewitruimte op mobiel, grotere hulptekst waar die 15 px was,
en een ZZP-bestelblok dat de beschikbare schermbreedte gebruikt. Geen gewijzigde
bedrijfsgegevens, mailconfiguratie, productclaims of externe afhankelijkheden.

## Controle

- Bij 390 px en 844 px schermhoogte: totale paginalengte van 23.566 naar 15.960 px
  (32% korter). Dit is geen laadsnelheidsmeting.
- npm test: 80/80 geslaagd na de laatste wijziging.
- Browsercontrole: 310/310 geslaagd, inclusief vier breedtes 320/375/768/1440,
  alle routecontroles en nieuwe toetsen voor vier zichtbare/16 beschikbare foto's,
  drie zichtbare/20 aanwezige artikelen, viewerfocus en afwezige scrollindicator.
- Een aanvankelijke testfout was de volgorde: een nieuwe viewerproef scrolde
  vóór de bestaande revealtest. Die proef staat nu na de revealtest.
- Visuele steekproeven: opening, welkom, toepassingskaart/voordelen, 3D-bediening,
  productoverzicht, ZZP-blok en vervolgpagina Coatings. Aanvullend een 414 px
  controle zonder horizontale overflow of afgekapt koptekst, plus artikellink 12.
- Geen testmail verstuurd. De Microsoft 365-adapter is ongewijzigd.
- Dit blijft desktopbrowser-emulatie; geen volledige fysieke iOS/Android-test.

De urenraming voor de vriendendienstnota staat los van deze reparatie. Herstel
van eigen fouten wordt niet als extra betaald werk opgevoerd.

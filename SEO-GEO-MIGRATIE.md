# Nijtec: vindbaarheid en veilige overstap

Onderzocht en geïmplementeerd op 21 oktober 2026. Dit document hoort bij de websitebroncode, niet bij een wijziging van DNS of het Google-account.

## Aanvullende controle, 23 oktober 2026

De nieuwe site staat inmiddels op het Nijtec-domein. De Microsoft 365-verzendproef
is op 22 oktober daadwerkelijk ontvangen volgens de gebruiker; de oude vermelding
van alleen een mailconcept geldt nu uitsluitend voor de terugvalroute.

De build bevat nu 17 pagina's: 15 behouden oorspronkelijke adressen, de nieuwe
`/producten/chemisch-anker/`-pagina en één nieuw
Quickbond-artikel op `/blog/quickbond-gevelbeplating-verlijmen/`. Het artikel heeft
direct leesbare HTML, organisatie als auteur, publicatiedatum, BlogPosting-data,
interne links vanaf homepage/productpagina/footer en opname in de sitemap met
projectafbeelding. Geen verzonnen klantvragen, zoekvolumes of verwerkingsgetallen.

Op verzoek is de oude categorie `/producten/luchtdicht-bouwen/` volledig vervallen.
De pagina, alle interne verwijzingen, sitemapvermelding, vier bijbehorende
afbeeldingen en hun thumbnail-/attachment-redirects worden niet gepubliceerd.
Zonder inhoudelijk equivalente vervanging krijgt de oude URL een echte 404,
geen misleidende homepage-redirect of robots-blokkade. Bronarchief is geen
publicatiebron zonder de beoordeling in `seo/publication-policy.cjs`.

De oude `/producten/2-componenten-lijmen/` verwijst permanent naar de nieuwe
chemisch-ankerpagina met Seal-it 720 Chem-Fix. De bijbehorende Poxyfix-foto en
oude verwijzingen zijn vervallen. Aangeleverde 478/479/720-foto's en de 479/720-
productbladen zijn ongewijzigd toegevoegd. Producttekst staat ook direct leesbaar
op de PU- en chemisch-ankerpagina, met eigen metadata en opname in de sitemap.

De geautomatiseerde SEO-controle gaat over alle 17 pagina's: unieke titles en
beschrijvingen, één H1, canonical/social-URL, interne links, media, bedrijfsgegevens,
gestructureerde data, oude URL's en sitemap. Dit is geen bewijs van indexering,
rankings, AI-vermelding of controle door André van iedere productclaim.

Openstaande aandachtspunten:

- De gebruiker heeft Vercel Domains gecorrigeerd: nijtec.nl serveert Production,
  www.nijtec.nl verwijst met 308 naar nijtec.nl. De livecontrole van 23 oktober
  bevestigde dit. Geen tweede hostredirect in de code toevoegen.
- Search Console: de gebruiker heeft domeineigendom via STRATO-TXT geverifieerd.
  Sitemapindiening, URL-inspectie en de werkelijk
  door Google gekozen canonical zijn niet bevestigd. Rich Results Test, PageSpeed
  Insights/velddatacontrole en Google Bedrijfsprofielcontrole staan ook nog open.
- Actuele productdocumenten en beoordeling van technische productclaims door
  André blijven nodig voor verdere technische verdieping.

Op 23 oktober opnieuw de primaire Google-richtlijnen voor AI-functies en behulpzame
inhoud geraadpleegd. Voor Google's AI-functies gelden de SEO-basis en indexering;
er is geen verplicht speciaal AI-bestand of GEO-schema. Andere AI-zoekdiensten
bepalen hun eigen selectie. Geen garantie op vindbaarheid of geciteerde antwoorden.

## Doel

Het bestaande Nijtec-resultaat zo goed mogelijk ondersteunen tijdens de verhuizing: dezelfde merknaam, dezelfde bedrijfsgegevens, bestaande inhoudelijke pagina-adressen en oorspronkelijke projectafbeeldingen. Een nieuwe vormgeving is geen reden om alle oude pagina’s naar de homepage om te leiden.

Google bepaalt zelf rankings, snippets, sitelinks en het uiterlijk van het bedrijfspaneel. Behoud of verbetering kan niet worden gegarandeerd. Een sitemap of gestructureerde data garandeert geen opname.

## In deze versie geregeld

- 15 behouden openbare WordPress-pagina’s hebben echte, direct leesbare HTML op hun bestaande adres. Onder andere `/over-ons/`, `/contact/`, `/producten/quickbond/`, `/producten/coatings/` en `/producten/vullende-lijmende-pu-schuimen/`. De oude 2-componentenlijmen-URL verwijst naar de chemisch-ankerpagina.
- Unieke paginatitels, beschrijvingen, één H1, Nederlandse taalinstelling, logische interne links en zelfverwijzende canonicals naar `https://nijtec.nl/`.
- LocalBusiness-, WebSite- en op vervolgpagina’s WebPage- en BreadcrumbList-data, met consistente naam, telefoon, adres en e-mail. Geen verzonnen reviews, openingstijden, voorraad of aanbiedingen in de data.
- XML-sitemap met de 15 behouden oorspronkelijke pagina’s, chemisch anker en het nieuwe artikel, plus beoordeelde afbeelding-URL’s; robots.txt verwijst naar de productiesitemap. Oude WordPress-sitemapadressen krijgen een permanente verwijzing.
- 103 beoordeelde oorspronkelijke afbeeldingen worden onder hun oude `/wp-content/uploads/…`-adres gepubliceerd. Alleen hun bekende WordPress-thumbnail- en attachment-adressen verwijzen permanent naar het bijbehorende origineel. Vier beelden van de vervallen categorie en de oude Poxyfix-foto zijn uitgesloten. Drie nieuwe aangeleverde productfoto's staan onder `/assets/products/`. Projectfoto’s gebruiken ook in de nieuwe galerij hun oorspronkelijke URL’s.
- Het afgesproken hoofdadres is `https://nijtec.nl/`. Beheer de www-omleiding uitsluitend bij Vercel Domains: nijtec.nl dient de productieversie, www.nijtec.nl verwijst daarnaar door. Geen tweede hostomleiding in vercel.json; die kan met een omgekeerde dashboardinstelling een redirectlus voor assets veroorzaken. Bestaande inhoudelijke pagina-adressen krijgen geen algemene homepage-redirect. Onbekende adressen krijgen een echte 404.
- Vercel-testdomeinen krijgen `X-Robots-Tag: noindex, follow`, zodat zij niet met de productiesite concurreren. Die regel geldt niet voor nijtec.nl.
- Alle 20 gepubliceerde artikelen van de algemene voorwaarden zijn zonder inhoudelijke herformulering overgenomen, inclusief de volledige pagina. Dit is geen juridische actualiteitscontrole.
- Afbeeldingsafmetingen voorkomen onnodige layoutverschuivingen. Lettertypen staan lokaal. Contactlinks zijn direct bruikbaar. Foto-onderschriften staan buiten het bewegende beeldvlak.

De inventaris is afkomstig uit de openbare WordPress-pagina- en media-API. Dit is géén volledige export van alle ooit geïndexeerde adressen of externe backlinks. WordPress-demopagina’s zijn bewust niet als inhoudelijke landingspagina meegenomen.

## GEO: vindbaarheid in AI-antwoorden

Google noemt geen afzonderlijke technische toelatingseisen voor AI Overviews/AI Mode bovenop de gebruikelijke zoekvoorwaarden. Daarom: duidelijke crawlbare productinformatie, echte bedrijfsidentiteit, goede interne verwijzingen en zichtbaar onderbouwde informatie. Geen verborgen tekst, honderden bijna gelijke plaatsnaampagina’s, verzonnen deskundigheid of beloften over AI-vermeldingen. Een `llms.txt`-bestand is geen Google-toelatingseis.

Nijtec heeft inhoudelijke pagina’s per productgroep, met toepassingsgerichte uitleg en contactmogelijkheden. Bestaande productnamen en claims moeten door André worden bevestigd voordat de nieuwe productieomgeving het huidige domein overneemt. Voor garantie en verwerking blijven de actuele productdocumenten en schriftelijke afspraken leidend.

## Google Bedrijfsprofiel: toegang voor Damian

De aangeleverde Google-screenshot toont een bestaande bedrijfsvermelding. Daarmee is niet vastgesteld wie eigenaar/beheerder is of of het profiel al is geclaimd.

1. André logt in met het Google-account waarmee hij Nijtec beheert en opent zijn profiel via Google Zoeken, Maps of `business.google.com`.
2. Via **Meer → Instellingen voor bedrijfsprofiel → Mensen en toegang → Toevoegen** nodigt hij Damians Google-account uit als **Beheerder**. André blijft hoofdeigenaar. Geen wachtwoorden delen.
3. Heeft André geen toegang, zoek dan via `business.google.com/add` naar de bestaande Nijtec-vermelding en controleer de naam/locatie/telefoon. Vraag toegang aan als iemand anders die beheert, of doorloop het claim- en verificatieproces als die nog ongeclaimd is. Voor een zuiver servicegebiedbedrijf kan Googles ondersteuningsroute nodig zijn.
4. Maak geen tweede profiel aan. Verificatie en toegang worden samen met André geregeld; niet namens hem zonder toestemming.

Na toegang controleren: bedrijfsnaam zonder zoekwoordtoevoegingen, juiste categorie en diensten, telefoon, website `https://nijtec.nl/`, daadwerkelijk geldende openingstijden of servicegebied, logo en echte projectfoto’s. Geen onjuiste vestigingslocatie of nepbeoordelingen toevoegen.

## Nodig vóór de echte domeinoverstap

- [ ] André bevestigt bedrijfsgegevens, productclaims, prijzen en de actualiteit van de bestaande voorwaarden.
- [ ] Toegang tot bestaande Search Console-property verkrijgen; prestaties, geïndexeerde pagina’s en relevante backlinks exporteren als nulmeting. Ontbrekende oude URL’s gericht toevoegen aan de migratiemapping.
- [ ] Bestaand Google Bedrijfsprofiel behouden; toegang regelen en gegevens controleren, geen nieuw duplicaatprofiel aanmaken.
- [ ] Nieuw domein in Vercel controleren en HTTPS/canonical/www/404/redirects testen. Domeinwijziging of DNS-omzetting is een afzonderlijke handeling, niet uitgevoerd door deze codewijziging.
- [ ] Huidige DNS en mailinstellingen vastleggen. MX, SPF, DKIM en DMARC niet verwijderen of vervangen bij het omschakelen van de website.
- [ ] Terugdraaiplan en back-up van de oude WordPress-site/hosting regelen.
- [ ] Op het echte productiedomein controleren dat `noindex` afwezig is, alles crawlbaar is en de canonical niet naar een testomgeving wijst. Controleer statuscodes en minstens de belangrijke bestaande pagina- en afbeeldings-URL’s.
- [ ] Nieuwe sitemap indienen in Search Console en relevante pagina’s controleren via URL-inspectie. Rich Results Test en PageSpeed Insights uitvoeren op de echte nieuwe productie-URL’s; velddatagegevens bouwen zich pas later op.
- [ ] Contacthandeling op echte iPhone/Android en desktop nalopen. Microsoft 365 verzendt nu rechtstreeks; zonder configuratie blijft het mailconcept beschikbaar. Ontvangst van één echte formulierproef is bevestigd, niet aflevering van ieder bericht of werking op alle apparaten.
- [ ] Na omschakeling Search Console op indexering, 404’s en zoekprestaties controleren. Deze checklist maakt niet automatisch een monitor aan.

## Onderhoud

`npm test` bouwt de site en controleert contactlogica, pagina-adressen, interne links/media, canonicals, JSON-LD, sitemap, redirectbestemmingen, preview-noindex en het behoud van voorwaarden. Vercel bouwt met `node scripts/build-pages.cjs` naar `dist/`. Publiceer niet alleen de losse bron-index: de build voegt de vaste pagina’s en volledige juridische tekst toe.

`seo/legacy-inventory.json` en `seo/legacy-terms.json` zijn vastgelegde openbare brongegevens. De import-/audit-scripts worden niet bij iedere deployment uitgevoerd; de build vereist geen toegang tot de oude hosting.

## Geraadpleegde primaire bronnen

- [Google: hosting wijzigen met behoud van URL’s](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes)
- [Google: migraties met URL-wijzigingen](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Google: sitelinks en interne structuur](https://developers.google.com/search/docs/appearance/sitelinks)
- [Google: AI-functies en de SEO-basis](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: LocalBusiness-data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google: mensen en toegang](https://support.google.com/business/answer/3403100?hl=nl)
- [Google: eigendom aanvragen](https://support.google.com/business/answer/4566671?hl=nl)
- [Google: dubbele profielen voorkomen](https://support.google.com/business/answer/12756178?hl=nl)
- [Vercel: projectconfiguratie](https://vercel.com/docs/project-configuration/vercel-json)
- [Bestaande Nijtec-site](https://nijtec.nl/), met openbare WordPress-pagina- en media-inventaris.

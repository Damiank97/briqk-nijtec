# Controle website — 22 oktober 2026

## Geslaagd

- `npm test`: 48 geautomatiseerde tests, nul fouten. Inclusief behoud van 17 pagina-adressen, 108 oorspronkelijke afbeeldingen, redirects, interne links, metadata, structured data, sitemap, testomgeving-noindex en alle 20 bestaande voorwaardenartikelen. Ook een controle dat broncode en uitvoer geen PHP-bestanden of PHP/Composer-runtime bevatten, geen tweede hostredirect introduceren en geen verborgen demobanner bevatten. Tests controleren behoud van het originele logo, het formulier met nep-mailtransport en dat de verkeerde mailprovider niet per ongeluk wordt geactiveerd. Ook bedrijfsverhaal, btw-nummer, productlabels en de fotogegevens op alle 17 pagina's zijn gecontroleerd. Zes Analytics-tests controleren de productiebeperking, privacykeuzes, URL-redactie, eenmalige initialisatie, openbare buildconfiguratie en integratie op alle pagina's. Negen Microsoft-tests controleren uitsluitend nagebootste OAuth/Graph-verzending, vaste mailadressen, validatie, time-outs, caching, foutafhandeling en het uitschakelen op previews. Twee nieuwe favicon-tests controleren de vierkante lichte ondergrond, het ingesloten byte-identieke logo en de integratie op alle pagina's.
- Browsercontrole van de gebouwde site in Chromium: 214 controles, nul fouten. Homepage op 320, 390, 768 en 1440 px breed; alle 16 vervolgpagina’s ook op 390 px geopend. Inclusief bestelknop naar formulier met behoud van eerder ingevulde tekst, de leesbare Over Nijtec-sectie en de productfoto's in alle acht pop-ups. Op alle vier breedtes is gecontroleerd dat de lokale testomgeving geen Analytics-tracker start en dat het welkomstverhaal direct onder het openingsbeeld staat.
- Geen horizontale pagina-overflow in de geteste breedtes. Alle homepageafbeeldingen geladen. Alle 16 projectfoto’s op meerdere scrollposities gecontroleerd: geen overlap met onderschriften of andere projectkaarten. Ook intro- en toepassingsfoto’s gecontroleerd.
- Eén revealmechanisme: eenmalig zichtbaar vanaf 88% van de viewport. Vóór de drempel onzichtbaar, daarna zichtbaar; terugscrollen verbergt inhoud niet opnieuw. Hele kaarten en tekstkolommen schuiven niet mee met scroll.
- Alle acht productvensters: juiste inhoud, focus binnen venster, Tab-begrenzing, Escape, terugkeerfocus zonder ongewenste scrollsprong. Aanvraagknop vult het formulier; wissen werkt.
- Fotoviewer: openen, vorige/volgende met rondgang, Escape en focus terug naar foto.
- 3D-canvas actief op alle vier breedtes. Begeleidende tekst staat buiten het modelvlak; bedienknoppen hebben een eigen ruimte. Visueel bekeken op mobiel formaat.
- Quickbond gebruikt één gezamenlijke sticky-scène op desktop, geen drie onafhankelijk plakkende kolommen. Bij meerdere scrollposities is de afstand tussen informatiepaneel en model identiek; tijdens het vastzetten blijft de paneelhoogte gelijk. Op mobiel blijven beide in de normale documentstroom. Het label Leveringsvorm heeft nu leesbaar contrast op het witte paneel.
- Contact: gekoppelde labels, lege/onjuiste gegevens geweigerd, alle velden in mailconcept, veilige codering van bijzondere tekens, lange berichten zonder afkappen via kopieerfallback. Geen ontvangstclaim. Kopiëren inclusief fallback bij geweigerde klembordtoegang in aparte logische tests.
- Gemeten layoutverschuiving tijdens het laden in de browserronde circa 0,013–0,029 CLS. Dit is een lokale labcontrole, geen PageSpeed-veldmeting.
- Geen opgevangen runtime- of ontbrekende-resourcefouten op de geteste pagina’s. Onbekende pagina geeft 404; oude sitemap verwijst naar nieuwe.

## Logo, tekst en bestellen — 22 oktober 2026

- Het originele logo is byte-identiek gebleven. Na afwijzing van het losse witte vlak door de gebruiker is de navigatie volledig paperLight gemaakt, met donkerblauwe Instrument Sans-tekst, compacte bedrijfsnaam en subtiele onderlijn. Geen losse logotegel of dikke oranje band. Dit is op alle 17 pagina's getest, inclusief de krappe navigatie op 320 px.
- Sectiekoppen hebben geen clip-masker meer en een regelhoogte van 1,08. De volledige onderkant van de j in 'verlijmd' is in de browser zichtbaar; ook g/p/y worden niet afgeknipt. Beeldreveals blijven behouden.
- Bestelling aanvragen opent het formulier met ZZP-pakket, aantallen/levering en een verzoek om prijsbevestiging. Geen telefoon-/WhatsApp-handoff. Gewone duidelijk gelabelde belknoppen blijven telefoonlinks.
- Strato SMTP via Node.js voorbereid: vaste ontvanger info@nijtec.nl, eigen mailbox als afzender, klantadres als Reply-To, TLS-controle, begrensde invoer, origin-controle, spamval, kortlevend ondertekend token, lokale rate limit en blokkering van dubbel klikken. Geen mailgegevens in browser of Git. Installatie gepind; npm meldde nul bekende kwetsbaarheden bij installatie.
- Zonder serversecret blijft de transparante mailapp-/kopieerroute actief. SMTP-fouten geven geen valse succesmelding. Een time-out wordt als onzekere verzending gemeld en niet automatisch herhaald.
- Correctie na gebruikersinformatie: het MX-record wijst naar Microsoft 365, niet Strato. De eerdere instructie SMTP_PASS in te vullen is vervallen. De Strato-adapter is aanvullend vergrendeld op expliciete providerkeuze; losse mailsecrets activeren hem niet. Microsoft 365 is inmiddels geautoriseerd en echt geconfigureerd; de gebruiker bevestigde ontvangst van de formulierproef. Een handmatige Outlook-beantwoordcontrole is nog niet expliciet bevestigd. Lokale rate limiting is niet verdeeld over instanties; aanvullende firewallregel aanbevolen. Zie MAIL-INSTELLEN.md en MICROSOFT365-INSTELLEN.md. Geen mail-/DNS-records gewijzigd.

## Bedrijfsverhaal, btw en productbeelden — 22 oktober 2026

- BTW NL866979001.B01 staat direct onder KvK op alle 17 pagina's en in de bedrijfsgegevens voor zoekmachines.
- Het welkomstverhaal 'Wij zijn Nijtec.' staat direct onder het openingsbeeld en vóór de toepassingen, niet meer na de projecten. Een menulink en hetzelfde verhaal op de bestaande /over-ons/ blijven behouden. De inhoud is gebaseerd op het oude verhaal: levering, Quickbond, Seal-it van Connect Products, technisch advies, montage en André Nijhof als aanspreekpunt. Geen verzonnen historie, officieel-dealerclaim of portret. Herkomst staat in seo/content-sources.md. Visueel bekeken op 1440, 768 en 390 px.
- Alle acht productpop-ups bevatten nu originele foto's: 14 zorgvuldig gekozen product-, materiaal- en toepassingsbeelden. Ze laden pas bij openen van de pop-up, hebben eigen afmetingen en onderschriften en openen in hun oorspronkelijke formaat in een nieuw tabblad. Focusbegrenzing, Escape en aanvraagactie blijven werken.
- Productlabels zijn visueel gecontroleerd. Een oud bestand genaamd super-all-360.png toont in werkelijkheid een Seal-it 350 Super-All; het onderschrift en de productpagina volgen nu het etiket. Kleine beelden worden niet opgeblazen. Geen oorspronkelijke foto of oorspronkelijke foto-URL is verwijderd of gewijzigd.

## Microsoft 365-contactformulier — 22 oktober 2026

- De gebruiker koos de bestaande Microsoft 365-mail en bevestigde beheerderstoegang. Geen Resend-account of extra verzenddienst aangemaakt.
- OAuth client credentials en Microsoft Graph sendMail over vaste HTTPS-hosts. Token alleen in servergeheugen, verversing vóór de vervaldatum, geen redirect of automatische herhaling van een mail-POST.
- Afzender én ontvanger zijn vast info@nijtec.nl; klantnaam en klantadres gaan naar Reply-To. Geen HTML-injectie, bijlagen, willekeurige ontvangers of nieuwe mailrechten in de browser. Microsofts 202 wordt afgewacht en alleen als serveracceptatie gemeld, niet als bewezen inboxaflevering.
- De gebruiker heeft de Microsoft-app en Application Mail.Send met scope uitsluitend info@nijtec.nl ingesteld, InScope=True aangetoond en de zes Production-instellingen in Vercel opgeslagen en heruitgerold. De openbare configuratieroute gaf enabled=true.
- Eén herkenbare test zonder klantgegevens is via het openbare formulier ingediend: NIJTEC-MAILTEST-20261022-A1. De interface meldde pas na Microsoft-acceptatie succes. De gebruiker bevestigde vervolgens daadwerkelijke ontvangst bij info@nijtec.nl. Geen tweede proef voor alleen visuele wijzigingen verstuurd. Reply-To is in automatische tests gecontroleerd; handmatig Beantwoorden in Outlook is nog niet expliciet bevestigd.
- MICROSOFT365-INSTELLEN.md bevat de beheerinstructies, waarschuwing voor optellende brede Entra-rechten, Secret-velden in Vercel, herpublicatie, echte Outlook-/Reply-To-test en terugvalroute.

## Favicon, productacties en berichtvak — aanvullende ronde 22 oktober 2026

- Het oude tabbladicoon gebruikte een bitmap met zwarte achtergrond. Het nieuwe
  vierkante SVG-icoon zet het ongewijzigde transparante logo op paperLight. Het
  originele logo in de menubalk en op producten is niet aangepast. Alle 17 pagina's
  verwijzen naar het nieuwe cache-adres. Visueel bekeken op 16, 32 en 48 pixels op
  lichte en donkere achtergrond; geen afzonderlijk nieuw beeldmerk gemaakt.
- Productacties krijgen hun volledige inhoudsbreedte en breken niet tussen tekst
  en pijl. Het berichtvak is 240 px hoog in plaats van 100 px, met verticale
  resize en leesbare regelafstand. De verzendroute is niet gewijzigd.
- Aanvullende Chromium-ronde: 222 controles, nul fouten op 320, 390, 768 en 1440 px,
  inclusief de 16 vervolgpagina's. Nieuwe controles voor het grotere verstelbare
  berichtvak en de niet-afbrekende productpijlen. Lokale CLS circa 0,020–0,047.
  De tests verstuurden geen mail. Geen nieuwe afleveringstest nodig voor deze
  uitsluitend visuele wijzigingen.

## Vercel Web Analytics: integratie

- Toegevoegd na expliciete toestemming van de gebruiker. Officiële SDK 2.0.1 voor de bestaande statische site, zonder Next.js/React-migratie.
- Alleen HTTPS nijtec.nl en www.nijtec.nl worden gemeten. Geen formulierteksten, aangepaste events, URL-zoekparameters of fragmenten. Do Not Track en Global Privacy Control voorkomen initialisatie.
- Alleen openbare same-origin-intakepaden worden uit Vercels buildconfiguratie overgenomen. Geen serversecrets in de HTML. Referrer-Policy aangescherpt naar strict-origin.
- De footer bevat een uitklapbare toelichting. Technische en privacygrenzen staan in ANALYTICS.md; dit is geen volledige privacyverklaring of juridische goedkeuring.
- Lokale tests bewijzen de integratie en afscherming, niet het aantal bezoekers in Vercels afgeschermde dashboard. Na publicatie wordt de openbare trackerroute apart gecontroleerd. Dashboardbevestiging vereist accounttoegang.

## Grenzen van deze controle

De browsercontroles zijn herhaalbaar: bouw met `npm run build`, start lokaal met `npm run serve:qa` en open `http://127.0.0.1:4173/__qa`. De controle verstuurt geen e-mail en is geen onderdeel van de openbare deployment. Alleen de testserver in `scripts/serve-qa.cjs` maakt die route beschikbaar.

Dit zijn Chromium-tests met verschillende viewportbreedtes, geen tests op alle fysieke iPhones/Androids of in Safari. Het daadwerkelijk openen/verzenden/ontvangen met iedere mailapp is niet end-to-end getest en vereist een echte ingestelde mailapp. Rechtstreekse Microsoft-verzending en ontvangst van één formulierproef zijn bevestigd, niet de aflevering van ieder toekomstig bericht. De reduced-motion-regels zijn geïmplementeerd; een aparte fysieke toegankelijkheidscontrole blijft verstandig.

Google-indexering, sitelinks, lokaal bedrijfspaneel en AI-vermeldingen zijn niet door een lokale test te bewijzen. Daarvoor zijn de echte domeinoverstap, Search Console en daarna waarneming nodig. Zie `SEO-GEO-MIGRATIE.md` voor de vereiste controles, inclusief mailrecords, André’s gegevens/productinformatie en terugdraaiplan.

De geautomatiseerde controles betekenen dus niet dat alle externe afhankelijkheden voor livegang al zijn geregeld. De bestaande `nijtec.nl`-hosting en het Google Bedrijfsprofiel worden door deze commit niet omgezet.

## Domeinherstel — 22 oktober 2026

Na de domeinkoppeling verwees Vercel nijtec.nl naar www.nijtec.nl, terwijl de projectconfiguratie assetverzoeken vanaf www naar nijtec.nl terugstuurde. Dit gaf een aantoonbare 308-lus voor CSS, logo, hero-afbeelding, scripts en lettertype. De HTML op www en de Vercel-link was identiek: dit was geen oude deployment.

De dubbele hostredirect is verwijderd uit vercel.json én de generator, zodat alleen Vercel Domains de hoofdvariant bepaalt. Ook de uitsluitend met CSS verborgen demobanner is uit de HTML verwijderd. De gewenste hoofdvariant blijft https://nijtec.nl/; de daadwerkelijke dashboardinstelling moet apart worden bevestigd. Er worden geen DNS-/mailrecords gewijzigd door deze codefix.

Na publicatie rechtstreeks gecontroleerd: www.nijtec.nl geeft 200 met de juiste bestandstypen voor CSS, logo, hero, motion-script, lettertype en de coatingspagina; de bestandshashes komen overeen met de werkende Vercel-versie. Nijtec.nl verwijst nog één keer naar www, zonder lus terug. In de browser op het echte domein zijn logo en hero geladen, Instrument Sans actief, de 3D-viewer actief en nul demobanners aanwezig. Het productiedomein geeft geen preview-noindex-header.

Nog open: het Vercel-dashboard vraagt opnieuw om accountverificatie. Voor de afgesproken hoofdvariant zonder www moet nijtec.nl aan Production worden gekoppeld zonder domeinredirect, en www.nijtec.nl daarnaar verwijzen. Hiervoor is Vercel-toegang nodig; dit is niet als uitgevoerd afgevinkt.

## PHP-controle

De nieuwe site bevat geen PHP-bestanden, PHP-interpreter, Composer of WordPress-installatie. HTML/CSS/JavaScript worden statisch gebouwd met Node.js; de bestaande `api/chat.js` is JavaScript voor Node.js, geen PHP. De oude WordPress-afbeeldingspaden zijn enkel statische bestanden. Er wordt geen PHP-code uit de oude hosting gekopieerd.

De oude publiek bereikbare `nijtec.nl` was bij de inventarisatie nog WordPress. De PHP-versie, patchstatus en overige diensten van die oude hosting zijn zonder beheerrechten niet geverifieerd. Dat de nieuwe site geen PHP gebruikt, zegt niets over de oude server of absolute veiligheid tegen andere kwetsbaarheden. Een domeinverhuizing schakelt een oude server bovendien niet vanzelf uit.

Op 21 oktober 2026 bevestigt [PHP zelf](https://www.php.net/archive/2026.php#2026-10-20-1) twee kritieke kwetsbaarheden en een aangekondigde beveiligingsrelease. Laat André’s huidige hoster de officiële update/mitigatie en eventuele overige PHP-diensten direct controleren. [CERT-EU](https://cert.europa.eu/publications/security-advisories/2026-018) adviseert snelle patching en zo nodig isolatie van blootgestelde toepassingen. Deze repositorycontrole is geen penetratietest en verklaart de oude hosting niet veilig.

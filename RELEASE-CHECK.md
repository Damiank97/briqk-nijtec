# Controle website — 21 oktober 2026

## Geslaagd

- `npm test`: 13 geautomatiseerde tests, nul fouten. Inclusief behoud van 17 pagina-adressen, 108 oorspronkelijke afbeeldingen, redirects, interne links, metadata, structured data, sitemap, testomgeving-noindex en alle 20 bestaande voorwaardenartikelen. Ook een controle dat broncode en uitvoer geen PHP-bestanden of PHP/Composer-runtime bevatten.
- Browsercontrole van de gebouwde site in Chromium: 154 controles, nul fouten. Homepage op 320, 390, 768 en 1440 px breed; alle 16 vervolgpagina’s ook op 390 px geopend.
- Geen horizontale pagina-overflow in de geteste breedtes. Alle homepageafbeeldingen geladen. Alle 16 projectfoto’s op meerdere scrollposities gecontroleerd: geen overlap met onderschriften of andere projectkaarten. Ook intro- en toepassingsfoto’s gecontroleerd.
- Eén revealmechanisme: eenmalig zichtbaar vanaf 88% van de viewport. Vóór de drempel onzichtbaar, daarna zichtbaar; terugscrollen verbergt inhoud niet opnieuw. Hele kaarten en tekstkolommen schuiven niet mee met scroll.
- Alle acht productvensters: juiste inhoud, focus binnen venster, Tab-begrenzing, Escape, terugkeerfocus zonder ongewenste scrollsprong. Aanvraagknop vult het formulier; wissen werkt.
- Fotoviewer: openen, vorige/volgende met rondgang, Escape en focus terug naar foto.
- 3D-canvas actief op alle vier breedtes. Begeleidende tekst staat buiten het modelvlak; bedienknoppen hebben een eigen ruimte. Visueel bekeken op mobiel formaat.
- Quickbond gebruikt één gezamenlijke sticky-scène op desktop, geen drie onafhankelijk plakkende kolommen. Bij meerdere scrollposities is de afstand tussen informatiepaneel en model identiek; tijdens het vastzetten blijft de paneelhoogte gelijk. Op mobiel blijven beide in de normale documentstroom. Het label Leveringsvorm heeft nu leesbaar contrast op het witte paneel.
- Contact: gekoppelde labels, lege/onjuiste gegevens geweigerd, alle velden in mailconcept, veilige codering van bijzondere tekens, lange berichten zonder afkappen via kopieerfallback. Geen ontvangstclaim. Kopiëren inclusief fallback bij geweigerde klembordtoegang in aparte logische tests.
- Gemeten layoutverschuiving tijdens het laden in de browserronde circa 0,013–0,029 CLS. Dit is een lokale labcontrole, geen PageSpeed-veldmeting.
- Geen opgevangen runtime- of ontbrekende-resourcefouten op de geteste pagina’s. Onbekende pagina geeft 404; oude sitemap verwijst naar nieuwe.

## Grenzen van deze controle

De browsercontroles zijn herhaalbaar: bouw met `npm run build`, start lokaal met `npm run serve:qa` en open `http://127.0.0.1:4173/__qa`. De controle verstuurt geen e-mail en is geen onderdeel van de openbare deployment. Alleen de testserver in `scripts/serve-qa.cjs` maakt die route beschikbaar.

Dit zijn Chromium-tests met verschillende viewportbreedtes, geen tests op alle fysieke iPhones/Androids of in Safari. Het daadwerkelijk openen/verzenden/ontvangen met iedere mailapp is niet end-to-end getest en vereist een echte ingestelde mailapp. De site verzendt niet zelf. De reduced-motion-regels zijn geïmplementeerd; een aparte fysieke toegankelijkheidscontrole blijft verstandig.

Google-indexering, sitelinks, lokaal bedrijfspaneel en AI-vermeldingen zijn niet door een lokale test te bewijzen. Daarvoor zijn de echte domeinoverstap, Search Console en daarna waarneming nodig. Zie `SEO-GEO-MIGRATIE.md` voor de vereiste controles, inclusief mailrecords, André’s gegevens/productinformatie en terugdraaiplan.

De geautomatiseerde controles betekenen dus niet dat alle externe afhankelijkheden voor livegang al zijn geregeld. De bestaande `nijtec.nl`-hosting en het Google Bedrijfsprofiel worden door deze commit niet omgezet.

## PHP-controle

De nieuwe site bevat geen PHP-bestanden, PHP-interpreter, Composer of WordPress-installatie. HTML/CSS/JavaScript worden statisch gebouwd met Node.js; de bestaande `api/chat.js` is JavaScript voor Node.js, geen PHP. De oude WordPress-afbeeldingspaden zijn enkel statische bestanden. Er wordt geen PHP-code uit de oude hosting gekopieerd.

De oude publiek bereikbare `nijtec.nl` was bij de inventarisatie nog WordPress. De PHP-versie, patchstatus en overige diensten van die oude hosting zijn zonder beheerrechten niet geverifieerd. Dat de nieuwe site geen PHP gebruikt, zegt niets over de oude server of absolute veiligheid tegen andere kwetsbaarheden. Een domeinverhuizing schakelt een oude server bovendien niet vanzelf uit.

Op 21 oktober 2026 bevestigt [PHP zelf](https://www.php.net/archive/2026.php#2026-10-20-1) twee kritieke kwetsbaarheden en een aangekondigde beveiligingsrelease. Laat André’s huidige hoster de officiële update/mitigatie en eventuele overige PHP-diensten direct controleren. [CERT-EU](https://cert.europa.eu/publications/security-advisories/2026-018) adviseert snelle patching en zo nodig isolatie van blootgestelde toepassingen. Deze repositorycontrole is geen penetratietest en verklaart de oude hosting niet veilig.

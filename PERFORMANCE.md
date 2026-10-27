# Prestatieverbetering, 27 oktober 2026

De vormgeving, originele merkbestanden, productinformatie, oorspronkelijke foto-URL's,
contactverzending en 3D-bediening blijven behouden.

## Implementatie

- De circa 760 kB 3D-dependencies worden pas geïmporteerd zodra de Quickbond-scène
  binnen 400 px van de viewport komt of toetsenbordfocus ontvangt. De poster blijft
  beschikbaar tijdens het laden of bij een WebGL-fout.
- Rendering is vraaggestuurd: tekenen bij scroll, drag, toetsen, buttons en resize;
  stoppen na stabilisatie, buiten beeld of in een verborgen tab. Scrollmetingen
  worden met requestAnimationFrame samengevoegd.
- Voor 95 goedgekeurde niet-merkafbeeldingen bestaan aparte WebP-voorbeelden.
  HTML en productpop-ups kiezen met srcset/sizes een passend formaat. Originelen
  blijven onaangetast en de fotoviewer opent nog steeds het oorspronkelijke bestand.
- Kleine oranje tekst en gedempte tekst hebben AA-contrast. Grote displaytekst
  heeft een aparte oranje variant; origineel oranje blijft beschikbaar op donkerblauw.
  Tekstreveals beginnen op 95% in plaats van 35% opacity. Beeldreveals blijven gelijk.
- Footerlinks zijn onderstreept en afbeeldingen hebben expliciete dimensies.
- Op schermen tot 900 px verschijnt de openingsfoto direct, zonder vertraagde
  clip/opacity-animatie. Een extra 768 px WebP voorkomt een onnodig grote
  downloadsprong op mobiele schermen. Overige reveals en 3D blijven behouden.

## Verificatie

Met Lighthouse 13.5.0, desktop-preset, eigen tijdelijk headless Chrome-profiel,
`--disable-gpu`, localhost en dezelfde instellingen voor/na: eerste nameting
98 performance / 100 accessibility / 100 best practices / 100 SEO, tegenover
80 / 94 / 100 / 100. TBT circa 173 ms naar 0 ms; CLS blijft 0.
Netwerkvolume tijdens die opening: circa 3,35 MB naar 0,97 MB. Dit zijn lokale
labmetingen, geen CrUX-velddata, Google-rankings of garantie op een PageSpeed-score.
De aangeleverde Google-test van 56 gebruikt een andere meetomgeving.

`npm test` controleert onder andere bronintegriteit, afmetingen, responsive media,
contrasttokens, deferred loading en originele URL's. `npm run serve:qa` biedt
`/__qa`: visuele/functionele controle op 320, 390, 768 en 1440 px inclusief
3D uitgesteld laden, pauzeren/hervatten, fotovergroting, focus en formulierfallback.
Geen echte e-mail verzenden bij deze regressietest.

## Nieuwe beelden voorbereiden

`scripts/prepare-images.cjs` gebruikt sharp uit de authoring-runtime. Voer dit
alleen uit voor door de eigenaar goedgekeurde originelen. Commit daarna de
gegenereerde bestanden onder assets/optimized en het bijbehorende manifest.
De normale productiebuild heeft geen sharp of externe afbeeldingsservice nodig.
Logo's zijn uitgesloten. Een nieuw assortiment wordt niet automatisch goedgekeurd
door het aan deze afbeeldingspipeline toe te voegen.

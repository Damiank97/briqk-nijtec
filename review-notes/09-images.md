# Bestaande beeldoptimalisatie behouden

Er zijn al responsive WebP-varianten voor 95 goedgekeurde niet-merkbeelden.
Ze worden met srcset/sizes gepubliceerd; de hero heeft 320/640/768/960/1600 px,
andere grote beelden 320/640/960/1600 px. Geen opschaling van kleine originelen.
De vermelde JPG/PNG-adressen blijven bewust bestaan voor de fotoviewer en oude links.

De hero heeft fetchpriority=high, vaste dimensies en geen lazy loading. De
Quickbond-poster heeft al transparante WebP-varianten. De 360°-viewer gebruikt
echte WebGL-geometrie met een labeltexture, geen verzameling fotoframes.

Herhalen: `npm run prepare:images`, met Sharp beschikbaar in de authoring-runtime
of via NODE_PATH. Dit is een bestaande ontwikkelhulp, geen extra deploymentstap.
Na toevoegen van foto's eerst publication-policy en brongegevens beoordelen;
daarna varianten/manifest genereren en committen. `npm test` controleert originelen,
toegelaten bronnen en dimensies. De productiebuild heeft geen Sharp nodig.

Geen tweede beeldpipeline, AVIF-set of nieuwe dependency toegevoegd. Gewicht en
mobiele labmetingen komen in het afzonderlijke eindrapport. Scores zijn
labmetingen en mogen niet als velddata of rankinggarantie worden gepresenteerd.

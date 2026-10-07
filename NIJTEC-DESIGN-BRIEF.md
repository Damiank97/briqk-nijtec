# Nijtec design contract — anti-generic / anti-AI

## Merkherkenning bij openen

- De eerste viewport moet zonder zoeken duidelijk maken dat dit de website van
  **Nijtec B.V.** is. De bedrijfsnaam staat daarom zichtbaar in navigatie én hero.
- Gebruik het Nijtec-logo niet als klein decoratief pictogram. Combineer het in
  de navigatie met de geschreven bedrijfsnaam en de regel “Service & Quality”.
- Nijtec-blauw (`#2e4d9a`, donker `#17264e`) is de dragende kleur voor navigatie,
  koppen en technische vlakken. Nijtec-oranje (`#ef762f`) markeert afzender,
  acties en belangrijke accenten.
- Het warme werkboekpapier blijft als ondergrond bestaan. Zo voelt de website
  eigen en technisch, zonder dat de Nijtec-huisstijl verdwijnt.

Gebruik dit document als bindende prompt voor iedere visuele wijziging aan de
Nijtec-website. Het is geen lijst met losse sfeerwoorden, maar een product- en
ontwerpcontract. Inspecteer de bestaande site en echte content voordat je code
wijzigt. Een wijziging is pas klaar na visuele controle op 1440, 768 en 390 px.

## Bindende art direction: Nijtec Werkboek

De actuele richting is **Nijtec Werkboek**: een digitale technische catalogus
en een register van uitgevoerd werk. Dit gaat boven algemenere aanwijzingen in
dit document. Gebruik `NIJTEC-DESIGN-TOKENS.json` als enige bron voor kleuren,
lettertypes, vorm en componentpatronen. Verzin geen lokale kleur, radius,
letterfamilie of schaduw buiten dat bestand zonder de reden te documenteren.

- Displaytekst: Georgia. Bodytekst: Verdana. Technische labels: Courier New.
- Palet: warm papier, Nijtec-blauw en Nijtec-oranje, afgeleid van het logo en
  bestaande Nijtec-fotografie. Blauw is dragend; oranje markeert acties en bewijs.
- De homepage is geen marketingtemplate. Zij leest als productcatalogus:
  omschrijving, toepassingen, productindex, levering, uitgevoerd werk en contact.
- Producten en voordelen zijn genummerde registerregels, geen kaarten.
- Projectfoto's behouden hun natuurlijke beeldverhouding en captions staan
  onder het beeld. Geen gradient-overlay op fotografie.
- Gebruik geen em dash in marketingcopy. Gebruik een punt, komma of nieuwe zin.
- Gebruik geen “Meer info”, “Ontdek meer” of vergelijkbare generieke CTA.
- De hoofdkop moet letterlijk noemen wat Nijtec levert en voor welke markt.

## Onderzoeksconclusie voor de informatiearchitectuur

- Geef de bezoeker twee herkenbare ingangen: **ik weet welk product ik zoek**
  en **ik weet wat ik wil uitvoeren**. De toepassingsingang staat direct na de
  hero en gebruikt echte Nijtec-projectfoto's.
- Houd per scherm één taak en één volgende stap aan. Apple gebruikt daarvoor
  één productboodschap met korte acties en veel beeld; Nijtec vertaalt dat naar
  één toepassing, één productroute en één adviesactie.
- Ontwerp voor technische kopers als beoordelaars: categorie, toepassing,
  ondergrond, verpakking, verwerkingsinformatie en contactmoment moeten zonder
  marketingtaal te vinden zijn.
- Maak een visueel systeem uit Nijtec-eigen bewijs. Geen abstracte 3D-vormen,
  stockfoto's, verzonnen resultaten of algemene SaaS-kaarten. Een productrender
  mag alleen wanneer die het echte product nauwkeurig volgt. Quickbond gebruikt
  een echte WebGL-productmesh met cilindrische geometrie, nozzle, schroefdraad,
  PBR-materiaal en een rondom gemapte labeltexture op basis van de aangeleverde
  koker. Een platte afbeelding is uitsluitend de technische fallback.
- Animatie mag de productuitleg ondersteunen: gebruik scroll-progress voor
  voortgang, subtiele reveal voor echte content en één interactieve 3D-visual
  voor Quickbond. Geen animatie op iedere losse tekstregel.
- De lokale True You-referentie gebruikt geen live 3D maar vooraf gerenderde
  WebM/MP4-productfilms. De relevante les is de cinematografische presentatie:
  grote media, weinig gelijktijdige boodschappen en `clip-path`-reveals die bij
  `entry` beginnen. Nijtec gebruikt voor Quickbond wél echte WebGL-geometrie en
  houdt gewone productinformatie standaard zichtbaar.
- Verberg nooit alle kaarten of lopende tekst tot een scrolltrigger afgaat.
  Alleen sectiekoppen en media krijgen een korte reveal (`entry 0%` tot circa
  `entry 38%`); technische inhoud is direct leesbaar.
- Alle animatie heeft een `prefers-reduced-motion`-variant waarin inhoud direct
  zichtbaar en volledig leesbaar blijft.

## 1. Product en gebruiker

- Bedrijf: Nijtec B.V. in Dalen.
- Werk: professionele lijmen, kitten, PU-schuimen, coatings, steenstrips,
  luchtdicht bouwen, technisch advies en montage.
- Primaire bezoekers: zzp'ers, aannemers en industriële vakmensen die snel
  willen bepalen of Nijtec een geschikt product, advies of montageteam heeft.
- Primaire uitkomst: voldoende vertrouwen en concrete informatie krijgen om
  te bellen, productinformatie op te vragen of een offerte aan te vragen.
- Bewijs boven belofte: echte projecten, concrete toepassingen, leveringsvormen,
  garantie, certificering en directe contactgegevens zijn belangrijker dan
  generieke marketingtaal.

## 2. Creatieve richting

Ontwerp Nijtec als een nuchter Nederlands technisch bedrijf met de visuele
houding van een goed vormgegeven architectuur- of materiaalcatalogus. De site
moet precies, tastbaar en vakmatig voelen. Gebruik redactionele compositie,
duidelijke maatverschillen, stevige typografie, dunne regels, echte fotografie
en gecontroleerde asymmetrie. De vormgeving mag verfijnd zijn, maar nooit glad,
speels of software-achtig.

De referenties TrueYou en Apple zijn alleen richtinggevend voor rust,
hiërarchie, beeldgebruik en discipline. Kopieer geen merkstijl, component of
lay-out letterlijk. Vertaal die principes naar bouw, materiaal en montage.

## 3. Verboden standaardpatronen

Voeg onderstaande patronen niet toe, tenzij de inhoud aantoonbaar geen betere
vorm heeft:

- geen gradient-hero's, glow, glassmorphism, blurpanelen of decoratieve blobs;
- geen verzameling identieke afgeronde cards;
- geen pill-buttons, pill-labels of een wolk van chips;
- geen emoji als product- of contacticonen;
- geen pictogram voor ieder los tekstpunt;
- geen gecentreerde SaaS-hero met badge, titel, tekst en twee grote knoppen;
- geen vage slogans zoals “innovatieve oplossingen” of “alles wat u nodig hebt”;
- geen claims zonder direct bewijs;
- geen zwevende AI-assistent of notification badge;
- geen animatie die alleen moderniteit moet suggereren;
- geen grote schaduwen of radius boven 4 px voor hoofdcomponenten;
- geen sectie die uitsluitend bestaat omdat landingspagina-templates dat doen.

## 4. Visueel systeem

### Lay-out

- Werk op desktop met een consistente contentbreedte van circa 1220 px en een
  onderliggende 12-kolomslogica.
- Gebruik asymmetrie doelgericht: hoofdboodschap links, bewijs of uitleg rechts.
- Scheid content primair met ruimte, maat, uitlijning en 1 px-regels; niet door
  iedere sectie in een gekleurde container te stoppen.
- Wissel informatiedichtheid bewust af: ruime introductie, compact productoverzicht,
  groot beeldbewijs, rustige contactafsluiting.
- Op mobiel blijft de inhoudsvolgorde gelijk aan de beslisvolgorde; geen aparte
  decoratieve mobiele compositie.

### Typografie

- Gebruik maximaal drie duidelijke tekstmaten per compositie.
- Koppen zijn compact en direct; bodytekst blijft 16–18 px met comfortabele
  regelafstand.
- Gebruik hoogstens twee gewichten. Vermijd overal vetgedrukte labels.
- Hoofdletters en tracking alleen voor kleine functionele rubrieken.
- Geen regels langer dan ongeveer 70 tekens voor lopende tekst.

### Kleur

- Basis: wit, inktzwart en Nijtec-donkerblauw.
- Oranje is een klein technisch accent voor actieve of belangrijke details,
  nooit een decoratieve waas of volledige interfacekleur.
- Houd contrast minimaal WCAG AA. Gedempte tekst moet nog steeds leesbaar zijn.

### Beeld

- Gebruik uitsluitend echte Nijtec-projectfoto's en product-/materiaalbewijs.
- Behoud de oorspronkelijke beeldverhouding; nooit rekken.
- Geef fotografie ruimte. Vermijd collages met veel gelijke miniaturen.
- Elke projectfoto is klikbaar en opent in een toegankelijke, volledige viewer
  met caption, teller, vorige/volgende, Escape en pijltjestoetsen.

## 5. Componentregels

- Primaire CTA: één rustige rechthoekige knop per beslismoment.
- Secundaire actie: tekstlink met pijl of onderstreping.
- Productoverzicht: regels of index, geen kaartjeswand.
- Productdetail: redactioneel dossier of zijpaneel met nummer, titel, omschrijving,
  kenmerken en toepassingen als gewone lijsten. Geen emoji, chips, afgeronde
  SaaS-modal of dikke schaduw.
- Formulieren: rechte velden, zichtbare labels, consistente hoogte, heldere focus.
- Hover toont interactiviteit subtiel; focus is altijd zichtbaar.
- Interactieve doelen zijn minimaal 44 x 44 px.

## 6. Copyregels

- Schrijf concreet: noem materiaal, toepassing, levering, garantie of vervolgstap.
- Gebruik de taal van bouw en montage, niet die van software/startups.
- Vermijd superlatieven tenzij ze bewijsbaar zijn.
- Een CTA beschrijft de echte volgende handeling, bijvoorbeeld “Bel voor advies”,
  “Vraag productinformatie” of “Bekijk project”.
- Verwijder elk tekstblok dat ook ongewijzigd op een willekeurige concurrent kan staan.

## 7. Gedrag en toegankelijkheid

- Gebruik semantische buttons en links; alle interactie werkt met toetsenbord.
- Een modal of beeldviewer krijgt focus, sluit met Escape, herstelt scroll en
  brengt focus terug naar het element dat hem opende.
- Respecteer `prefers-reduced-motion`.
- Geen horizontale scroll op 390 px.
- Afbeeldingen hebben betekenisvolle alt-tekst en lazy loading buiten de eerste view.

## 8. Werkvolgorde voor de agent

1. Inspecteer repository, huidige render, echte content en referenties.
2. Noteer eerst concrete afwijkingen; gebruik geen vage beoordeling als “meer premium”.
3. Herstel in deze volgorde: productlogica, informatievolgorde, lay-out,
   typografie, componentvorm, interactiestaten, details.
4. Voeg geen nieuwe library toe als HTML/CSS/JS volstaat.
5. Bewaar bestaande inhoud en werkende functies tenzij de opdracht anders zegt.
6. Test dezelfde flows op 1440, 768 en 390 px: navigatie, productdetail,
   projectviewer, formulier en toetsenbordbediening.
7. Controleer console, ontbrekende assets, focus, Escape, pijltjestoetsen,
   lange teksten en reduced motion.
8. Rapporteer wat bewust afwijkt van de referenties en waarom.

## 9. Eindcontrole

Een versie mag pas worden opgeleverd als op alle vragen “ja” volgt:

- Is binnen vijf seconden duidelijk wat Nijtec verkoopt en voor wie?
- Kan de merknaam niet simpelweg door een SaaS-naam worden vervangen?
- Blijft de hiërarchie overeind wanneer kleur, schaduw en animatie uitstaan?
- Zijn productdetail en homepage zichtbaar onderdeel van hetzelfde systeem?
- Worden echte projecten als bewijs gebruikt en zijn ze volledig bekijkbaar?
- Heeft iedere opvallende vorm een inhoudelijke functie?
- Werken de belangrijkste interacties met muis, touch en toetsenbord?
- Zijn desktop, tablet en mobiel visueel gecontroleerd?

## Onderzoeksbasis

- Reddit / ClaudeCode, praktijkdiscussie over generieke AI-sites en het vooraf
  vastleggen van een designsysteem
  https://www.reddit.com/r/ClaudeCode/comments/1r5zy5n/aigenerated_websites_always_look_generic_how_do/
- Reddit / Lovable, praktijkdiscussie over vaste ontwerpbesluiten vóór de bouw
  https://www.reddit.com/r/lovable/comments/1txecyk/how_do_you_stop_aibuilt_websites_from_looking/
- Jacob Perks, “How to stop your frontend looking AI-generated”
  https://medium.com/design-bootcamp/how-to-stop-your-frontend-looking-ai-generated-efbb9681a6a2
- Webnexus, “7 pitfalls bij AI-gegenereerde websites”
  https://webnexus.nl/blog/7-pitfalls-bij-ai-gegenereerde-websites/
- Interwijs, “AI-optimalisatie”
  https://www.interwijs.nl/blog/ai-optimalisatie/
- SaaSCity, “Stunning frontend designs: avoid AI slop”
  https://saascity.io/blog/stunning-frontend-designs-vibe-coding-avoid-ai-slop

- InterfaceKit, “What makes a website look AI-generated?”
  https://blog.interfacekit.io/what-makes-a-website-look-ai-generated
- InterfaceKit, “How to prompt AI for UI design”
  https://guides.interfacekit.io/prompt-ai-for-ui-design
- Nielsen Norman Group, “5 Visual-design Principles in UX”
  https://media.nngroup.com/media/articles/attachments/Principles_Visual_Design-A4.pdf
- Apple, “UI Design Dos and Don’ts”
  https://developer.apple.com/design/tips/
- MDN, “Scroll-driven animations”
  https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
- MDN, scroll timeline range names
  https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/Timeline_range_names
- Khronos, glTF 2.0 runtime asset specification
  https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
- Google / web.dev, “3D on the web” product case study
  https://web.dev/case-studies/3d-on-the-web
- Chrome for Developers, “Scroll-driven animations”
  https://developer.chrome.com/docs/css-ui/scroll-driven-animations
- W3C, “C39: Using the CSS prefers-reduced-motion media feature”
  https://www.w3.org/WAI/WCAG22/Techniques/css/C39
- Apple, iPhone product storytelling
  https://www.apple.com/iphone/
- Outdo BMC, industrial product website case study
  https://www.outdo.agency/portfolio/item/bmc-case-study/
- Mettevo / Contrinex, spec- and application-led industrial navigation
  https://mettevo.com/projects/contrinex
- Shin et al., “Interrogating Design Homogenization in Web Vibe Coding”
  https://arxiv.org/abs/2603.13036

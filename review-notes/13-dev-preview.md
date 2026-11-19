# Nijtec: devvoorstel en correcties op 19 november 2026

De gebruiker heeft expliciet gevraagd het voorstel op Vercel dev te zetten. Main en de productieconfiguratie blijven behouden. Dit document vult rapport 12 aan.

## Wat is daadwerkelijk gewijzigd?

1. Knoppen en tekstacties: groter lettertype, normale hoofdletters, minimaal 44 px hoog en zichtbare toetsenbordfocus. Kleine technische labels naar 12 px; leesbare hoverkleur.
2. Toepassingskaarten: Gevel naar Quickbond, Verlijmen naar het assortiment en Oppervlak beschermen naar Coatings.
3. Typografie: conflicterende lettertypefamilies samengebracht in de bestaande Instrument Sans en technische mono; prijsgetallen gelijkvormig.
4. Openingssectie en ZZP: bestaand dienstenpaneel ingevuld, dubbele badge verwijderd en één bestelactie in het pakketblok.
5. Claims: onduidelijke ISO-toeschrijving vervangen door productinformatie; bestaande Quickbond-garantie gekoppeld aan artikel 12 met verzoek specifieke voorwaarden op te vragen. Schriftelijke onderbouwing blijft nodig.
6. Formulier: navy velden, beter leesbare placeholders en focus. Productcontext staat los van het eigen bericht; geen verstuurbare voorgeschreven vraag meer. Eigen invoer blijft behouden en lege/oude sjablonen worden geweigerd.
7. Footerlogo: licht contrastvlak en normale afbeeldingsweergave. De eerste versie gebruikte per ongeluk het oude bestand met zwarte achtergrond; deze correctie gebruikt de reeds bestaande transparante logo-asset uit de header. Het artwork is niet bewerkt.
8. Beeldworkflow: bestaande optimalisatie als npm-opdracht beschikbaar gemaakt en gedocumenteerd; geen nieuwe beeldpipeline of hercompressie van merkbeelden.
9. Afwerking: telefoon/mail in de footer gelijkvormig, alleen de weergavekop van juridisch artikel 2 genormaliseerd, deelafbeelding 1200×630 en passende OG/Twitter-metadata.
10. Projecten en chatbot: drie korte samenvattingen uit bestaande bijschriften; geen verzonnen resultaten of quotes. De verborgen chatbot heeft serverregels, begrensde invoer en verwijst herkenbare technische vragen direct door. De chatbot is niet zichtbaar gemaakt.

De bestaande Microsoft 365-verzendadapter, mailserverroute en portalinstellingen zijn niet gewijzigd. Ook de bestaande bedrijfsgegevens, originele foto-URL's, hoofdkop en sitemaproutes blijven behouden.

## Herstelde projectfout

Het nieuwe projectblok was automatisch in de 170 px labelkolom van de bestaande sectie geplaatst. Binnen die 170 px bleven voor kop en beschrijving nul pixels over, naast een link en de tussenruimtes. Dit veroorzaakte de door de gebruiker getoonde over elkaar vallende tekst.

Het projectblok beslaat nu alle sectiekolommen. De nieuwe browsercontrole toetst beschikbare breedte, minimale tekstkolombreedte en onderlinge overlap. Vóór de fix signaleert deze op de homepage en /projecten/ op 1440 px elk zeven problemen; na de fix niet meer. De oorspronkelijke 299 controles dekten dit nieuwe blok niet afzonderlijk: een geslaagde oude controle bewees dus geen foutloze projectweergave.

## Mailen: productie tegenover dev

Een alleen-lezen controle van https://nijtec.nl/api/contact geeft enabled=true en een beschikbaar formuliertoken. Dat bevestigt dat directe verzending op de live site ingeschakeld is. Geen echte testmail verstuurd; daadwerkelijke ontvangst is hier niet opnieuw bewezen.

De bestaande servercode schakelt rechtstreeks mailen op Vercel preview/development uit, ook wanneer daar instellingen aanwezig zijn. Het lokale voorbeeld heeft evenmin de productieconfiguratie en toont daardoor de al bestaande mailprogramma-terugval. Die terugval is niet als vervanging van Microsoft 365 toegevoegd. Deze wijziging schakelt geen productiegeheimen in op dev en verandert dat bestaande beleid niet.

## Controle van de correcties

- npm test: 80/80 geslaagd, inclusief controle van de transparante footerbron op alle 17 gebouwde pagina's.
- Uitgebreide schermmatrix: 35 combinaties (zeven paginatypen × 375/768/900/901/1440 px), geen projectproblemen, horizontale overflow of geregistreerde runtimefouten.
- Projecten en footer visueel bekeken; aanvullende mobiele weergave op 390 px en tablet op 768 px.
- CSS-cacheversie 35 → 36. Geen nieuwe dependency en geen nieuwe e-mail- of analyticsconfiguratie.

Zie [matrix vóór herstel](evidence/project-layout-before.json) en [matrix na herstel](evidence/project-layout-after.json).

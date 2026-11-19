# Projectfoto direct openen

De drie links bij de projectbeschrijvingen openen de bestaande fotoviewer direct
met de juiste foto. Ze scrollen niet meer naar een galerijanker. Sluiten herstelt
de focus op de gebruikte link, zonder de pagina of URL te verplaatsen.

De links verwijzen zonder JavaScript nog steeds naar de echte originele foto;
Ctrl/Cmd-klik en andere standaard linkacties blijven behouden. De galerij en
bestaande foto-ID's blijven beschikbaar. De beschrijvingen blijven gewone HTML.

De tabelachtige plaatsing is een keuze voor leesbare projectinformatie, geen
SEO-vereiste. Deze wijziging verandert alleen de fotoactie, niet de inhoud,
projectindeling, mailkoppeling of productiesite. Publicatie gaat uitsluitend naar dev.

Validatie: npm test (80 tests) en de aanvullende browsermatrix controleren de
juiste foto, ongewijzigde URL/scrollpositie en focusherstel na Escape voor alle
drie links op de homepage en projectpagina op vijf schermbreedtes.

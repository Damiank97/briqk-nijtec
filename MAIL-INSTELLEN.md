# Contactformulier: Microsoft 365, niet Strato

## Werking

De gebruiker heeft de mailinstellingen verduidelijkt: het getoonde MX-record is
`nijtec-nl.mail.protection.outlook.com`. Dat wijst op inkomende mail via Microsoft
365 / Exchange Online. Strato beheert hier DNS; dat betekent niet dat de mailbox
bij Strato staat. Wijzig deze DNS-records niet voor het contactformulier.

**De eerdere instructie om een Strato-mailboxwachtwoord in Vercel in te vullen
is vervallen. Vul ook geen gewoon Outlook-wachtwoord in.** Rechtstreekse
websiteverzending via Microsoft 365 is op 22 oktober 2026 geactiveerd en de gebruiker
heeft ontvangst van de echte test bevestigd. De mailconcept-/kopieerroute blijft
beschikbaar als terugvalroute bij ontbrekende configuratie of verzendproblemen.

Bestelling aanvragen opent het contactformulier met de pakketnaam, ruimte voor
producten/aantallen en levering. Dit is een aanvraag, geen betaling of definitieve
order. Nijtec bevestigt prijs, voorraad en levering zelf.

## Ingestelde Microsoft-koppeling en herstelcontrole

1. Bevestig bij de Microsoft 365-beheerder dat info@nijtec.nl een actieve mailbox
   is, en of dit een gebruikersmailbox of gedeelde mailbox is.
2. De gebruiker koos Microsoft 365 en bevestigde beheerderstoegang. De server-
   adapter is geïmplementeerd en met een neptransport getest. Alleen OAuth over
   vaste HTTPS-adressen; geen Resend of SMTP AUTH. Volg MICROSOFT365-INSTELLEN.md.
3. Registreer en autoriseer de app met Exchange Application RBAC voor alleen
   info@nijtec.nl. Plaats tenant-ID, client-ID, mailbox-object-ID, appsecret en een aparte formulier-
   sleutel uitsluitend in Vercel Production, en kies MAIL_PROVIDER=microsoft365.
   De gebruiker heeft de mailboxgebonden Application Mail.Send-toewijzing aangemaakt,
   InScope=True gecontroleerd en de zes Production-instellingen opgeslagen en heruitgerold.
   Deze stappen zijn nu herstelreferentie; maak niet opnieuw dezelfde app/toewijzing aan.
4. Test op de productiesite één herkenbare aanvraag, controleer Outlook Inbox én
   Ongewenste e-mail en controleer dat Beantwoorden naar de klant gaat.

Een bevestiging van een verzendserver bewijst nog geen aflevering in de inbox.
Geef geen succesmelding vóór serveracceptatie en herhaal een onzekere verzending
niet automatisch. Bewaar de gegevens voor een veilige fallback.

## Beveiliging en grenzen

- De eerder voorbereide Strato-adapter blijft uitgeschakeld. Alleen mailsecrets
  toevoegen activeert hem niet; hij vereist expliciet MAIL_PROVIDER=strato.
  **Die instelling hoort niet bij de getoonde Microsoft 365-configuratie.**
- Alleen JSON, begrensde invoer, vaste ontvanger, geen bijlagen of externe
  bestandstoegang, geen door de klant instelbare mailheaders.
- Exact toegestane origins, een ondertekend kortlevend formulier-token, spamval,
  dubbele-aanvraagbeperking en een lokale limiet van 3 aanvragen per kwartier per
  IP plus 30 per uur per function-instantie. IP's worden alleen gehasht en tijdelijk
  in geheugen gehouden. Geen formulierinhoud of SMTP-details in applicatielogs.
- De lokale limiet en het geheugen voor verbruikte tokens zijn **niet gedeeld
  tussen serverless-instanties**; dit is geen wereldwijde replaygarantie. Voor extra
  bescherming: voeg in Vercel **Firewall → Rules** een rate-limitregel toe op
  POST `/api/contact`, per IP bijvoorbeeld 5 per 15 minuten. Beschikbaarheid en
  kosten hangen af van het Vercel-abonnement; niet door deze code ingesteld.
  Voor hardnekkige spam is daarnaast een echte botchallenge nodig.
- Geen absolute spam- of aflevergarantie. DNS/mailrecords blijven ongewijzigd.
- Bewaar appsecrets uitsluitend in Vercel-secrets, nooit in browser of Git.

## Bewijs en resterende controle

Automatische tests gebruiken een neptransport: geen echte mail of klantgegevens
worden verstuurd. Zij bewijzen geen werkende Microsoft 365-verzending. Ook een
positieve configuratiestatus bewijst geen juiste rechten of inboxaflevering.

Aanvullend is op 22 oktober 2026 één herkenbare proef via het openbare formulier
verzonden: NIJTEC-MAILTEST-20261022-A1, zonder klantgegevens. Microsoft accepteerde
de verzending en de gebruiker bevestigde ontvangst bij info@nijtec.nl. De werking
van Reply-To is automatisch getest; handmatig Beantwoorden in Outlook is nog niet
expliciet bevestigd. Dit ene geslaagde bericht is geen aflevergarantie voor alle
volgende berichten. Vernieuw het appsecret vóór de daadwerkelijk ingestelde vervaldatum.

Bron: [Microsoft Graph sendMail](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0).

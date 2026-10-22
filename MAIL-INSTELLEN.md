# Contactformulier: Microsoft 365, niet Strato

## Werking

De gebruiker heeft de mailinstellingen verduidelijkt: het getoonde MX-record is
`nijtec-nl.mail.protection.outlook.com`. Dat wijst op inkomende mail via Microsoft
365 / Exchange Online. Strato beheert hier DNS; dat betekent niet dat de mailbox
bij Strato staat. Wijzig deze DNS-records niet voor het contactformulier.

**De eerdere instructie om een Strato-mailboxwachtwoord in Vercel in te vullen
is vervallen. Vul ook geen gewoon Outlook-wachtwoord in.** Rechtstreekse
websiteverzending is nog niet geactiveerd. De bestaande mailconcept-/kopieerroute
blijft beschikbaar en claimt niet dat Nijtec het bericht heeft ontvangen.

Bestelling aanvragen opent het contactformulier met de pakketnaam, ruimte voor
producten/aantallen en levering. Dit is een aanvraag, geen betaling of definitieve
order. Nijtec bevestigt prijs, voorraad en levering zelf.

## Nog nodig voor rechtstreekse verzending

1. Bevestig bij de Microsoft 365-beheerder dat info@nijtec.nl een actieve mailbox
   is, en of dit een gebruikersmailbox of gedeelde mailbox is.
2. Kies en autoriseer de verzendkoppeling. Microsoft Graph met OAuth is een
   passende route: alleen verzenden namens de afgesproken mailbox, zonder
   mailboxwachtwoorden in de website. De beheerder moet de rechten beperken tot
   die mailbox; brede tenant-toegang mag niet automatisch worden toegestaan.
3. Bouw en configureer die adapter pas op basis van de gekozen/geautoriseerde
   Microsoft-instellingen. De Microsoft-adapter is nog niet geïmplementeerd of
   getest; alleen het ontvangstformulier en de bestelroute zijn gereed.
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
- Een lokale limiet is **niet gedeeld tussen serverless-instanties**. Voor extra
  bescherming: voeg in Vercel **Firewall → Rules** een rate-limitregel toe op
  POST `/api/contact`, per IP bijvoorbeeld 5 per 15 minuten. Beschikbaarheid en
  kosten hangen af van het Vercel-abonnement; niet door deze code ingesteld.
  Voor hardnekkige spam is daarnaast een echte botchallenge nodig.
- Geen absolute spam- of aflevergarantie. DNS/mailrecords blijven ongewijzigd.
- Bewaar appsecrets uitsluitend in Vercel-secrets, nooit in browser of Git.

## Bewijs en resterende stap

Automatische tests gebruiken een neptransport: geen echte mail of klantgegevens
worden verstuurd. Zij bewijzen geen werkende Microsoft 365-verzending.

Bron: [Microsoft Graph sendMail](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0).

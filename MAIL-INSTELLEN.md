# Contactformulier via Strato

## Werking

De website verstuurt via een Node.js-functie op Vercel, met versleutelde SMTP
naar Strato. Geen PHP, externe mail-API of klantmailapp nodig na activering.
Ontvanger is vast `info@nijtec.nl`. De afzender is de eigen Nijtec-mailbox;
het adres van de bezoeker is alleen Reply-To. Er gaat geen automatische
bevestigingsmail naar een door een bezoeker opgegeven adres.

Bestelling aanvragen opent het contactformulier met de pakketnaam, ruimte voor
producten/aantallen en levering. Dit is een aanvraag, geen betaling of definitieve
order. Nijtec bevestigt prijs, voorraad en levering zelf.

## Activeren (door de beheerder)

1. Open Vercel en kies project **briqk-nijtec**.
2. Open **Settings → Environment Variables → Add Environment Variable**.
3. Naam: `SMTP_PASS`. Waarde: het wachtwoord van de **mailbox info@nijtec.nl**,
   niet het algemene Strato-beheerwachtwoord. Markeer als **Sensitive** en kies
   **Production**. Sla op. Niet delen in een chat, screenshot of Git.
4. Voeg ook `CONTACT_FORM_SECRET` toe: een nieuwe willekeurige geheime tekst van
   minimaal 32 tekens, gegenereerd door bijvoorbeeld een wachtwoordmanager.
   Gebruik niet het mailboxwachtwoord. Ook **Sensitive**, alleen **Production**.
5. Alleen als de verzendmailbox anders heet: stel ook `SMTP_USER` in op een
   bestaande `@nijtec.nl`-mailbox. Standaard is dit `info@nijtec.nl`.
6. Open **Deployments**, kies de nieuwste productieversie en **Redeploy**.
   Nieuwe omgevingsvariabelen gelden pas na een nieuwe deployment.
7. Open nijtec.nl opnieuw. De knop hoort nu **Verstuur bericht** te heten.
8. Stuur één herkenbare testaanvraag met eigen gegevens. Controleer in Strato
   Inbox én Spam dat alle gegevens zijn aangekomen. Beantwoord de test en
   controleer dat die bij de ingevulde afzender aankomt.

Zonder configuratie of als de configuratiecheck niet bereikbaar is, blijft de
eerlijk gelabelde mailapp-/kopieerroute beschikbaar. Na een onzekere verzending
wordt geen mailapp automatisch geopend: eerst controleren, om dubbele berichten
te voorkomen. Een SMTP-acceptatie bewijst niet dat de mail in de inbox staat.

## Beveiliging en grenzen

- Strato SMTP: `smtp.strato.com`, poort 465, TLS met certificaatcontrole.
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
- Geen absolute spam- of aflevergarantie. DNS/mailrecords blijven ongewijzigd;
  controleer SPF/DKIM/DMARC bij Strato als de ontvangsttest problemen toont.
- Bewaar het mailboxwachtwoord uitsluitend in Vercel-secrets. Voor hogere
  scheiding kan later een aparte verzendmailbox worden gemaakt.

## Bewijs en resterende stap

Automatische tests gebruiken een neptransport: geen echte mail of klantgegevens
worden verstuurd. De echte Strato-authenticatie, spammap en Reply-To-ontvangst
kunnen pas na de configuratie door de beheerder worden bevestigd.

Bronnen: [Strato SMTP-instellingen](https://www.strato.nl/faq/mail/kan-ik-mijn-e-mail-met-een-beveiligde-verbinding-ssl-of-tls-verzenden/),
[SMTP op Vercel](https://vercel.com/kb/guide/serverless-functions-and-smtp),
[Nodemailer SMTP](https://nodemailer.com/smtp).

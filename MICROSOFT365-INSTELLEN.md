# Contactformulier rechtstreeks naar Outlook

De code is gereed voor Microsoft 365, maar verzendt pas na onderstaande
beheerinstellingen. Er is nog geen echte Microsoft-mail verstuurd of ontvangen.
Er is geen Resend-account of extra verzenddienst nodig. Geen PHP, wijziging van
MX-records, SMTP AUTH of mailboxwachtwoord. De bestaande mailbox blijft intact.

## 1. Een eigen website-app registreren

Open https://entra.microsoft.com/ met het Nijtec-beheerdersaccount. Controleer
eerst dat de juiste organisatie is geselecteerd.

Ga naar **Entra ID → App registrations / Appregistraties → New registration**.
Naam: **Nijtec website contactformulier**. Kies alleen accounts in deze organisatie
(single tenant). Een redirect-URI is voor deze serverkoppeling niet nodig.

Bewaar uit het overzicht **Directory (tenant) ID** en **Application (client) ID**.
Deze twee identificatienummers zijn geen wachtwoorden.

Maak zelf onder **Certificates & secrets → Client secrets** een appsecret.
Gebruik de **Value**, niet het Secret ID. Vul de waarde rechtstreeks in Vercel in
(stap 3), nooit in deze chat of Git. Bewaar hem in een wachtwoordmanager, noteer
de vervaldatum en vervang hem tijdig. Een verlopen secret legt de verzending stil.

## 2. Alleen verzendrecht voor info@nijtec.nl

**Beheerhandeling met beveiligingsimpact:** geef de app geen toegang tot alle
mailboxen. Laat de Exchange-beheerder deze stap uitvoeren en controleren.

Gebruik Exchange Online Application RBAC met alleen **Application Mail.Send**.
De scope bevat uitsluitend de actieve mailbox info@nijtec.nl. Geen Mail.Read,
Mail.ReadWrite, Full Access of aanvullend organisatiebreed Mail.Send in Entra:
Entra-rechten en RBAC-rechten tellen bij elkaar op en kunnen de beperking opheffen.

Onderstaand voorbeeld is voor een beheerder die al via Connect-ExchangeOnline
is verbonden. Vul twee app-ID's in. `ObjectId` komt uit **Enterprise applications
/ Bedrijfstoepassingen**, niet uit Appregistraties. Dit voorbeeld niet blind
opnieuw uitvoeren als namen of toewijzingen al bestaan.

```powershell
$nijtecClientId = 'VUL-APPLICATION-CLIENT-ID-IN'
$nijtecServicePrincipalId = 'VUL-OBJECT-ID-UIT-ENTERPRISE-APPLICATIONS-IN'
Get-EXOMailbox -Identity 'info@nijtec.nl' | Format-List PrimarySmtpAddress,RecipientTypeDetails,ExternalDirectoryObjectId
New-ServicePrincipal -AppId $nijtecClientId -ObjectId $nijtecServicePrincipalId -DisplayName 'Nijtec website contactformulier'
New-ManagementScope -Name 'NijtecWebsiteInfoOnly' -RecipientRestrictionFilter "PrimarySmtpAddress -eq 'info@nijtec.nl'"
New-ManagementRoleAssignment -Name 'NijtecWebsiteSendOnly' -App $nijtecServicePrincipalId -Role 'Application Mail.Send' -CustomResourceScope 'NijtecWebsiteInfoOnly'
Test-ServicePrincipalAuthorization -Identity $nijtecServicePrincipalId -Resource 'info@nijtec.nl'
```

Controleer dat alleen info@nijtec.nl in scope is. Test ook een andere bestaande
mailbox: die moet **InScope False** geven. Controleer daarnaast apart dat Entra
geen brede mailrechten bevat: het testcommando controleert die niet. Nieuwe
rechten kunnen door Microsofts cache 30 minuten tot 2 uur nodig hebben.

Bewaar ook ExternalDirectoryObjectId van de mailbox voor stap 3. Dit voorkomt
problemen als het mailadres info@nijtec.nl afwijkt van de Microsoft-inlognaam.

## 3. Geheime instellingen in Vercel

Open project **briqk-nijtec → Settings → Environment Variables**. Voeg deze
waarden uitsluitend aan **Production** toe, niet aan Preview of Development:

| Naam | Waarde | Type |
| --- | --- | --- |
| MICROSOFT_TENANT_ID | Directory (tenant) ID uit stap 1 | Config |
| MICROSOFT_CLIENT_ID | Application (client) ID uit stap 1 | Config |
| MICROSOFT_MAILBOX_ID | ExternalDirectoryObjectId van de info@nijtec.nl-mailbox uit stap 2 | Config |
| MICROSOFT_CLIENT_SECRET | De appsecret-Value, geen mailboxwachtwoord | Secret |
| CONTACT_FORM_SECRET | Een afzonderlijke willekeurige sleutel van minstens 32 tekens, bijvoorbeeld 64 willekeurige hextekens uit een wachtwoordmanager | Secret |
| MAIL_PROVIDER | microsoft365 | Config |

Zet MAIL_PROVIDER pas als laatste, nadat de mailboxscope gecontroleerd is.
Eventuele oude SMTP_USER/SMTP_PASS zijn voor Microsoft niet nodig. Gebruik nooit
PUBLIC_, NEXT_PUBLIC_ of VITE_-voorvoegsels voor geheimen. Maak een nieuwe
Production-deployment via **Deployments → Redeploy**; gewijzigde instellingen
gelden niet voor reeds actieve deployments.

Vóór activering: configureer zo mogelijk een Vercel-firewalllimiet voor POST
/api/contact. De code begrenst aanvragen per warme function-instantie, niet
verdeeld over alle instanties. Zie MAIL-INSTELLEN.md voor de grenzen. Geen
betaalde firewalloptie activeren zonder akkoord over eventuele kosten.

## 4. Echt testen vóór afronden

1. Open https://nijtec.nl/contact/. De knop moet **Verstuur bericht** tonen.
   Dat bewijst alleen dat de vereiste instellingen aanwezig zijn.
2. Verstuur één herkenbare test met uw eigen e-mailadres en een unieke testtekst.
3. Controleer info@nijtec.nl in Outlook: Inbox, Ongewenste e-mail én Verzonden
   items. Controleer naam, bedrijf, e-mailadres, onderwerp en volledig bericht.
4. Kies Beantwoorden. De ontvanger moet het ingevulde klantadres zijn.
5. Controleer een onjuist e-mailadres, dubbel klikken en de foutmelding bij een
   mislukte aanvraag. De ingevulde tekst moet bewaard blijven.

De server wacht op Microsofts 202 Accepted. Dat is verwerking door Microsoft,
geen aflevergarantie. Er is geen automatische herhaling bij een time-out om
dubbele mails te voorkomen. Bij twijfel eerst in Outlook controleren.

Terugvallen: verwijder MAIL_PROVIDER uit Production en publiceer opnieuw. Het
formulier biedt dan de mailapp-/kopieerroute. Trek ongebruikte apprechten en
geheimen daarna als beheerder gecontroleerd in; wijzig geen mail-/DNS-records.

## Technische grenzen en bronnen

De automatische tests gebruiken een nep-Microsoftserver, geen echte tokens of
berichten. De app leest geen mailbox, bewaart tokens alleen tijdelijk in server-
geheugen en stuurt alleen naar info@nijtec.nl. De browser krijgt geen appsecret.
Microsoft kan verzending weigeren door ontbrekende rechten, mailboxstatus,
verlopen credentials, tenantbeleid of throttling. Dit vereist een echte test.

- [Appregistratie](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)
- [Microsoft OAuth client credentials](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow)
- [Mailboxgebonden Application RBAC](https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac)
- [sendMail en betekenis van 202](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0)
- [Vercel Config en Secret](https://vercel.com/docs/environment-variables/sensitive-environment-variables)

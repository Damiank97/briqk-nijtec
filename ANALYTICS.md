# Vercel Web Analytics

De gebruiker heeft op 22 oktober 2026 expliciet toestemming gegeven voor het
toevoegen van bezoekers- en paginaweergavestatistieken.

## Implementatie

- Officieel pakket @vercel/analytics 2.0.1, zonder React of Next.js. De build
  kopieert de browsermodule naar dist/assets/vendor/vercel-analytics.js.
- Analytics start alleen op HTTPS nijtec.nl en www.nijtec.nl. Geen localhost,
  Vercel-preview of andere domeinen in de telling.
- Alleen pageviews. Geen formulierteksten of eigen meetevents. beforeSend
  reduceert de URL tot het huidige vaste canonical-pagina-adres, zonder query
  of fragment. Onverwachte paden en externe URL's worden geweigerd.
- Do Not Track en Global Privacy Control blokkeren het starten van de meetcode.
- Referrer-Policy strict-origin voorkomt dat de browser volledige verwijzende
  URL's met zoekparameters doorstuurt. Vercel ontvangt normale netwerkgegevens
  voor de verwerking; dit is geen claim dat alle persoonsgegevens ontbreken.
- In de footer staat een uitklapbare toelichting met link naar Vercels uitleg.
- De build neemt alleen de openbare same-origin-paden uit Vercels
  VERCEL_OBSERVABILITY_CLIENT_CONFIG over. Nooit het hele omgevingsobject.
  Daarmee werkt de nieuwe v2-intakeconfiguratie; zonder configuratie geldt de
  officiële standaardroute van de SDK.

## Controleren in Vercel

Kies project briqk-nijtec → Analytics → Production en de juiste periode. Web
Analytics moet daar zijn ingeschakeld. Een dashboard zonder data bewijst niet
dat er geen bezoekers waren: ook een ontbrekende of geblokkeerde meetcode kan
de oorzaak zijn. Na activering moet een nieuwe deployment worden gepubliceerd.
Adblockers, browserprivacykeuzes en trackingpreventie kunnen de telling beperken.

Automatische lokale tests verzenden niets. Na publicatie worden script laden
en een gewone paginaweergave gecontroleerd; die test kan één bezoek meetellen.
Bevestiging in het afgeschermde Vercel-dashboard vereist accounttoegang.
Deze integratie wijzigt geen abonnement of betaalde opties en vervangt geen
volledige privacyverklaring of juridische beoordeling.

Bronnen:
[Vercel Quickstart](https://vercel.com/docs/analytics/quickstart),
[gevoelige gegevens weglaten](https://vercel.com/docs/analytics/redacting-sensitive-data),
[privacy en verzamelde gegevens](https://vercel.com/docs/analytics/privacy-policy).

// Only the display heading changes. Preserve archived source and every article body.
const original=require('./legacy-terms.json');
const oldTitle='Artikel 2: algemene voorwaarden van contractspartijen en/of derden.';
const title='Artikel 2: Algemene voorwaarden van contractspartijen en/of derden';
module.exports={...original,html:original.html.replace(oldTitle,title),articles:original.articles.map(a=>({...a,title:a.title===oldTitle?title:a.title}))};

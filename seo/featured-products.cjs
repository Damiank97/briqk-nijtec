// Product identities and assets explicitly supplied by Nijtec via the user.
// 478 copy: owner's supplied three properties. 479/720: supplied technical sheets.
const photo=(file,name,description,features,document)=>({src:'/assets/products/'+file,name,width:196,height:400,kind:'portrait',description,features,...(document?{document}:{})});
module.exports={
  stonefix:photo('seal-it-478-pu-stonefix.png','Seal-it 478 PU-Stonefix',
    'Gebruiksklare, watervaste polyurethaanlijm, specifiek voor het verlijmen van diverse steensoorten.',
    ['IJzersterke verlijming van steensoorten','Hoge trek-, afschuif- en eindsterkte','Snelle uitharding en krachtopbouw']),
  black:photo('seal-it-479-pu-foam-gun-black.png','Seal-it 479 PU-Foam Gun Black',
    'Snel uithardend zwart isolatie- en montageschuim voor het afdichten en opvullen van voegen, naden, aansluitingen en stel- en montageruimten tussen bouwdelen.',
    ['Nijtec is de enige dealer van Seal-it 479 PU-Foam Gun Black in Noord-Nederland.','1-component polyurethaanschuim','Low expansion: schuimt licht op tijdens uitharding','Niet UV-bestendig; niet geschikt voor onderwatergebruik'],
    {src:'/assets/documents/seal-it-479-pu-foam-gun-black.pdf',label:'Technisch productblad 479 (PDF)'}),
  anchor:photo('seal-it-720-chem-fix.png','Seal-it 720 Chem-Fix',
    'Gecertificeerd 2-componenten chemisch anker op basis van styreenvrije polyesterhars voor het verankeren van draadeinden, schroeven en bouten.',
    ['ETA 19/0799 gecertificeerd','Snelle krachtopbouw met een sterk eindresultaat','Voor massieve en holle ondergronden, volgens de productinstructies'],
    {src:'/assets/documents/seal-it-720-chem-fix.pdf',label:'Technisch productblad 720 (PDF)'})
};

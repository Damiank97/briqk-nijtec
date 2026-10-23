// Original Nijtec media, visually checked against the printed product labels.
// Some legacy filenames are inaccurate: super-all-360.png actually shows 350.
const media = (file, name, width, height, kind = 'packshot') => ({
  src: '/wp-content/uploads/2023/10/' + file, name, width, height, kind
});
module.exports = {
  lijmen: [
    media('high-tack-360.png', 'Seal-it 360 High-Tack', 1600, 1067),
    media('super-all-360.png', 'Seal-it 350 Super-All', 1600, 1067)
  ],
  kitten: [
    media('topflex-p230.png', 'Seal-it 230 Topflex-P', 1600, 1067),
    media('silocon-nf215.png', 'Seal-it 215 Silicon-NF', 1600, 1067)
  ],
  pu: [
    media('pu-foam-gun-470.png', 'Seal-it 470 PU-Foam Gun', 1600, 1067),
    media('pu-foam-flex-471.png', 'Seal-it 471 PU-Foam Flex', 1600, 1067)
  ],
  coatings: [media('epoxy-aanbrengen.jpg', 'Aanbrengen van een epoxyvloer', 1600, 900, 'application')],
  '2comp': [media('poxyfix.png', 'Seal-it 530 Poxyfix', 1067, 1600, 'portrait')],
  steenstrips: [
    media('01.png', 'Steenstrips: kleur en metselverband', 444, 306, 'material'),
    media('example10.png', 'Steenstrips: materiaal en achterzijde', 703, 263, 'material')
  ],
  acrylaten: [
    media('uni-acryl110.png', 'Seal-it 110 Uni-Acryl', 1600, 1067),
    media('top-acryl115.png', 'Seal-it 115 Top-Acryl', 1600, 1067)
  ]
};

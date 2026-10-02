import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
const [,, src, out, w, h] = process.argv;
const r = new Resvg(fs.readFileSync(src, 'utf8'), {
  fitTo: { mode: 'width', value: +w },
  font: { loadSystemFonts: false, fontFiles: ['/usr/share/fonts/truetype/sand-box/custom/Pretendard/Pretendard-Bold.otf', '/usr/share/fonts/truetype/sand-box/custom/Pretendard/Pretendard-Light.otf', '/usr/share/fonts/truetype/sand-box/custom/Pretendard/Pretendard-Medium.otf', '/usr/share/fonts/truetype/sand-box/custom/Pretendard/Pretendard-Regular.otf', '/usr/share/fonts/truetype/sand-box/custom/Pretendard/Pretendard-SemiBold.otf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'], defaultFontFamily: 'Pretendard' },
});
const png = r.render().asPng();
fs.writeFileSync(out, png);
console.log(out, r.width, r.height, png.length);

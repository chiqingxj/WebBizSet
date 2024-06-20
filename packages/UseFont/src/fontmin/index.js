const Fontmin = require('fontmin');
const fs = require('fs');

// const fontmin = new Fontmin()
//     .src('Source_Han_Sans_SC_Regular.ttf')
//     .dest('build/fonts');

// fontmin.run(function (err, files) {
//     if (err) {
//         throw err;
//     }

//     console.log(files[0]);
// });

// const fontmin = new Fontmin()
//     .src('Source_Han_Sans_SC_Regular.ttf')
//     .use(Fontmin.ttf2woff2({
//         text: '一乙二十',
//         deflate: true
//     }))
//     .dest('build/fonts');

const text = fs.readFileSync('3500.txt', 'utf8').replace(/\s+/g, '');


const fontmin = new Fontmin()
    .src('eryaxindahei.ttf')
    .use(Fontmin.glyph({ 
        text,
        hinting: false
    }))
    .use(Fontmin.ttf2woff2({
        deflate: true
    }))
    .dest('result/fonts/eryaxindahei-3500');

fontmin.run(function (err, files) {
    if (err) {
        throw err;
    }

    console.log(files[0]);
});
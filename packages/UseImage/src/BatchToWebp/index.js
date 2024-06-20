const webp = require('webp-converter');
const path = require('path');

// let files = []
// files = require.context('./images', false, /\.(jpg|png)$/);

// const images = files.keys().map((key) => {
//     return {
//         name: key.replace(/\.\/(.*)\.\w+$/, '$1'),
//         url: files(key),
//     };
// });

const images = [
    {
        name: 'img_0',
        url: path.resolve(__dirname, './images/img_0.png')
    }
];

const transforms = images.map(({ name, url }) => {
    return webp.cwebp(url, path.resolve(__dirname, `./result/${name}.webp`), "-q 80", logging="-v")
});

// Promise.all(transforms);

// const result = webp.cwebp("nodejs_logo.jpg","nodejs_logo.webp","-q 80",logging="-v");
// result.then((response) => {
//   console.log(response);
// });
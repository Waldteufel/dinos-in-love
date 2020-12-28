const assets = require.context('../assets/images');

export async function loadImage(name) {
    let img = new Image();
    img.src = assets('./' + name).default;
    await img.decode();
    return img;
}
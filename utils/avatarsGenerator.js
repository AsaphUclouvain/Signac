const jdenticon = require("jdenticon");

const avatarsGenerator = (uniqString)=>{
    const size = 200;
    const png = jdenticon.toPng(uniqString, size);
    const base64 = "data:image/png;base64," + png.toString("base64");
    return (base64);
}

module.exports = avatarsGenerator;
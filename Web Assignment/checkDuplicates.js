const themeData = require("./data/themeData"); // Adjust the path if needed

const idMap = {};
const duplicates = [];

themeData.forEach(theme => {
    if (idMap[theme.id]) {
        duplicates.push(theme.id);
    } else {
        idMap[theme.id] = true;
    }
});

if (duplicates.length > 0) {
    console.log("Duplicate IDs found:", duplicates);
} else {
    console.log("No duplicate IDs found.");
}

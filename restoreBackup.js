const fs = require('fs');

const convertedPoemsBackup = fs.readFileSync('./convertedPoemsBackup.json', {encoding: 'utf-8'});
fs.writeFile('./convertedPoems.json', JSON.stringify(JSON.parse(convertedPoemsBackup), null, 4), (err) => {
    if (err) {
        console.log("Backup not restored:");
        console.log(err);
    } else {
        console.log('Backup restored!');
    }
})
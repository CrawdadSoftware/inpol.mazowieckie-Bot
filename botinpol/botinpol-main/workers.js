
const { exec } = require('node:child_process');
let workersNumber = 30;
let i = setInterval(
    function() {
        workersNumber--;
        if(workersNumber == 0)
        clearInterval(i);
        exec("node run.js", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
        },500)

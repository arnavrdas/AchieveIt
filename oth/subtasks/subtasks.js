/**************************** Sample input ****************************/

// Task
//  Subtask 1
//   Subtask 2
//    Subtask 3
//     Subtask 4

/************************** Global Variables **************************/

    // document.getElementById
        const list = document.getElementById('list');

    // Get from localstorage
        const subtasks = JSON.parse(localStorage.getItem('subtasks')) || [];

/*********************** Initial Function calls ***********************/

// alert(subtasks);
show();

/***************************** Functions ******************************/

    // Indentation
    //     function newline() {

    //             let newInput = userInput.value;

    //             let splitInput = newInput.split("\n");

    //             let i = 0;
    //             let len = splitInput.length;
                
    //         // Check
    //             let text = "0: " + splitInput[i];
    //             i++;
    //             while (i < len) {
    //                 text += "\n" + i + ": " + splitInput[i];
    //                 i++;
    //             }
    //             alert(text);

    //     }

    // Preprocess input
    //     function input() {
    //         alert("Input taken");
    //         userInput.value= "";

            
    //         // subtasks.push(splitInput);
    //         // save();
    //         // // alert(subtasks);
    //     }

    // Display tasks
        function show() {
            document.getElementById('list').innerHTML = '';

            for (let a in subtasks) {
                for (let b in subtasks[a]) {
                    for (let c in subtasks[a][b]) {
                        for (let d in subtasks[a][b][c]) {
                            for (let e in subtasks[a][b][c][d]) {
                                const listItem = document.createElement('li');
                                if (b == 0) {
                                    listItem.className = 'task';
                                } else if (c == 0) {
                                    listItem.className = 'subtask-1';
                                } else if (d == 0) {
                                    listItem.className = 'subtask-2';
                                } else if (e == 0) {
                                    listItem.className = 'subtask-3';
                                } else {
                                    listItem.className = 'subtask-4';
                                }
                                listItem.textContent = /*a + "\t" + b + "\t" + c + "\t" + d + "\t" + e + "\t|\t" +*/ subtasks[a][b][c][d][e];
                                list.appendChild(listItem);
                            }
                        }
                    }
                }
            };
        }

    // Save to localstorage
        function save() {
            localStorage.setItem('subtasks', JSON.stringify(subtasks));
        }

/*************************** EventListeners ***************************/

    // UserInput

    // userInput.addEventListener("keydown", (e) => {
    //     switch (e.key) {
    //     }
    // });
// +-------+--------+--------------------+-----------+---------------------+
// |       | Scope  | Declare before use | Redeclare |        Notes        |
// +-------+--------+--------------------+-----------+---------------------+
// |  var  | Global |    No (hoisted)    |    Can    | Most mistake-prone  |
// | const | Block  |        Yes         |   Can't   |                     |
// |  let  | Block  |        Yes         |   Can't   | Least mistake-prone |
// +-------+--------+--------------------+-----------+---------------------+


/************************** Global Variables **************************/

    // document.getElementById
        const quadrant1 = document.getElementById('quadrant1');
        const quadrant2 = document.getElementById('quadrant2');
        const quadrant3 = document.getElementById('quadrant3');
        const quadrant4 = document.getElementById('quadrant4');
        const singlelist = document.getElementById('singlelist');

    // Get from localstorage
        const todaysTasks = JSON.parse(localStorage.getItem('todaysTasks')) || [];
        const allTasksQuadrant1 = JSON.parse(localStorage.getItem('allTasksQuadrant1')) || [];
        const allTasksQuadrant2 = JSON.parse(localStorage.getItem('allTasksQuadrant2')) || [];
        const allTasksQuadrant3 = JSON.parse(localStorage.getItem('allTasksQuadrant3')) || [];
        const allTasksQuadrant4 = JSON.parse(localStorage.getItem('allTasksQuadrant4')) || [];
        const archivedTasksQuadrant1 = JSON.parse(localStorage.getItem('archivedTasksQuadrant1')) || [];
        const archivedTasksQuadrant2 = JSON.parse(localStorage.getItem('archivedTasksQuadrant2')) || [];
        const archivedTasksQuadrant3 = JSON.parse(localStorage.getItem('archivedTasksQuadrant3')) || [];
        const archivedTasksQuadrant4 = JSON.parse(localStorage.getItem('archivedTasksQuadrant4')) || [];
        const routineTasks = JSON.parse(localStorage.getItem('routineTasks')) || [];

    // Other
        const views = [
            [allTasksQuadrant1, allTasksQuadrant2, allTasksQuadrant3, allTasksQuadrant4],
            [todaysTasks],
            [archivedTasksQuadrant1, archivedTasksQuadrant2, archivedTasksQuadrant3, archivedTasksQuadrant4],
            [routineTasks]
        ]
        const settings = JSON.parse(localStorage.getItem('settings')) || [0, false];
        // settings[0]: views
        // settings[1]: color modes

/*********************** Initial Function calls ***********************/

        switchView(settings[0]);
        displayTasks();

    // Switch color modes
        if (settings[1]) {
            darkMode();
        }
        else {
            lightMode();
        }

/***************************** Functions ******************************/

    // Preprocess input
        function preprocessInput() {
            let newTask = userInput.value;          // Take input
            let validateTask = newTask.split("|");  // Split Input
            let len = validateTask.length;

            // Validate pipes
                if (len != 4) {
                    if (len < 4) {
                        len = 4 - len;
                        if (len == 1) {
                            alert("1 pipe missing \n\nEnter the Task, Deadline, Schedule and Impact seperated by pipes ( | ) \n\n>>> Task | Deadline | Schedule | Impact");
                        }
                        else {
                            alert(len + " pipes missing \n\nEnter the Task, Deadline, Schedule and Impact seperated by pipes ( | ) \n\n>>> Task | Deadline | Schedule | Impact");}
                    }
                    else {
                        len = len - 4;
                        if (len == 1) {
                            alert("1 extra pipes \n\nEnter the Task, Deadline, Schedule and Impact seperated by pipes ( | ) \n\n>>> Task | Deadline | Schedule | Impact");
                        }
                        else {
                            alert(len + " extra pipes \n\nEnter the Task, Deadline, Schedule and Impact seperated by pipes ( | ) \n\n>>> Task | Deadline | Schedule | Impact");
                        }
                    }
                }
                else {

                    // Trim whitespace
                        for (let i = 0; i < 4; i++) {
                            validateTask[i] = validateTask[i].trim();
                        }

                    // Validate task
                        if (validateTask[0] == "") {
                            alert("Can't add an empty task. \nEnter a task.");
                        }
                        else {

                            // Validate deadline
                                // if (validateDate(validateTask[1])) {
                                //     alert("Please correct the format of DEADLINE");
                                // }
                                // else {

                                    // Validate schedule
                                        // if (validateDate(validateTask[2])) {
                                        //     alert("Please correct the format of SCHEDULE");
                                        // }
                                        // else {

                                            // Validate impact
                                                if (validateTask[3] != "/" && validateTask[3] != "") {
                                                    alert("For tasks with Long-term Impact \n>>> Enter / \n\nFor tasks with No Long-term Impact \n>>> Leave it empty");
                                                }
                                                else {

                                                    // Concatinate validated task
                                                        let validTask = "";
                                                        let j = 0;
                                                        
                                                        validTask = validTask.concat(" ", validateTask[j]).trim();
                                                        j++;
                                                        for (; j < 4; j++) {
                                                            validTask = validTask.concat("|", validateTask[j]);
                                                        }

                                                        if (settings[0] == 0 || settings[0] == 2) {
                                                            if (validateTask[1] != "") {
                                                                if (validateTask[3] == "/") {
                                                                    views[settings[0]][0].push(validTask);
                                                                }
                                                                else {
                                                                    views[settings[0]][2].push(validTask);
                                                                }
                                                            }
                                                            else {
                                                                if (validateTask[3] == "/") {
                                                                    views[settings[0]][1].push(validTask);
                                                                }
                                                                else {
                                                                    views[settings[0]][3].push(validTask); 
                                                                }
                                                            }
                                                        }
                                                        else if (settings[0] == 1) {
                                                            todaysTasks.push(validTask);
                                                        }
                                                        else if (settings[0] == 3) {
                                                            routineTasks.push(validTask);
                                                        }

                                                        saveTasks();
                                                        displayTasks();
                                                        userInput.value = " |  |  | ";
                                                        setTimeout(() => {
                                                            userInput.setSelectionRange(0, 0);
                                                            userInput.focus();
                                                        }, 0);
                                                }

                                        // }
                                // }
                        }
                }
        }
        /* function validateDate(x) {
            // Month
            let month = x.toLowerCase();
            switch(month) {
                case "":
                case "01":
                case "1":
                    alert("uary");
                    break;

                case "feb":
                case "02":
                case "2":
                    alert("February");
                    break;

                case "mar":
                case "03":
                case "3":
                    alert("March");
                    break;
                
                case "apr":
                case "04":
                case "4":
                    alert("April");
                    break;

                case "may":
                case "05":
                case "5":
                    alert("May");
                    break;

                case "jun":
                case "06":
                case "6":
                    alert("June");
                    break;

                case "jul":
                case "07":
                case "7":
                    alert("July");
                    break;

                case "aug":
                case "08":
                case "8":
                    alert("August");
                    break;

                case "sep":
                case "09":
                case "9":
                    alert("September");
                    break;

                case "oct":
                case "10":
                    alert("October");
                    break;

                case "nov":
                case "11":
                    alert("November");
                    break;

                case "dec":
                case "12":
                    alert("December");
                    break;

                default:
                    alert("Not found");
            }
        } */

    // Display tasks
        function displayTasks() {

            // Delete all existing 'li'
                [quadrant1, quadrant2, quadrant3, quadrant4, singlelist].forEach(q => q.innerHTML = '');
            
            // ...
                let lists = views[settings[0]];
                for (let i = 0; i < views[settings[0]].length; i++) {
                    for (let j = 0, len = lists[i].length; j < len; j++) {

                            let splitTask = lists[i][j].split("|");  // Split each element of the array into Task, Deadline, Schedule & Impact
                            let index = j;                           // Index
                            let list;                                // Identify quadrant

                        // Identify quadrant
                            if (settings[0] == 0 || settings[0] == 2) {
                                list = i == 0 ? quadrant1 : i == 1 ? quadrant2 : i == 2 ? quadrant3 : quadrant4;
                            }
                            else {
                                list = singlelist;
                            }

                        // Create li element
                            const listItem = document.createElement('li');
                            listItem.className = 'taskli';
                            listItem.draggable = true;
                            listItem.addEventListener('dragstart', handleDragStart);
                            listItem.addEventListener('dragover', handleDragOver);
                            listItem.addEventListener('drop', handleDrop);
                            listItem.addEventListener('dragend', handleDragEnd);
                            list.appendChild(listItem);

                        // Highlight impactful tasks in Today's view (using symbol)
                            // if (settings[0] == 1) {
                            //     const divImpact = document.createElement('div');
                            //     if (splitTask[3] == "/") {
                            //         divImpact.textContent = "*";
                            //     }
                            //     divImpact.className = 'col-info';
                            //     divImpact.classList.add("highlightImpactfulTask");
                            //     listItem.appendChild(divImpact);
                            // }
                        // Highlight impactful tasks in Today's view (using numbering)
                            if (settings[0] == 1 || settings[0] == 3) {
                                const divQuadrant = document.createElement('div');
                                if (splitTask[1] != "") {
                                    if (splitTask[3] == "/") {
                                        divQuadrant.textContent = "‼️"; // Quadrant 1
                                    }
                                    else {
                                        divQuadrant.textContent = ""; // Quadrant 3 
                                    }
                                }
                                else if (splitTask[1] == "") {
                                    if (splitTask[3] == "/") {
                                        divQuadrant.textContent = "⭐"; // Quadrant 2 
                                    }
                                    else {
                                        divQuadrant.textContent = ""; // Quadrant 4 
                                    }
                                }
                                divQuadrant.className = 'col-info';
                                listItem.appendChild(divQuadrant);
                            }
                        // Highlight impactful tasks in Today's view (using background color)
                            // if (settings[0] == 1 && splitTask[3] == "/") {
                            //     listItem.classList.add("highlightImpactfulTask2");
                            // }

                        // Create "Deadline" div
                            if (splitTask[1] != "" || settings[0] == 1 || settings[0] == 3) {
                                const divDeadline = document.createElement('div');
                                divDeadline.textContent = splitTask[1];
                                divDeadline.className = 'col-info';
                                listItem.appendChild(divDeadline);
                            }
                        
                        // Create "Schedule" div
                            const divSchedule = document.createElement('div');
                            divSchedule.textContent = splitTask[2];
                            divSchedule.className = 'col-info';
                            listItem.appendChild(divSchedule);
                            
                        // Create "Task" div
                            const divTask = document.createElement('div');
                            divTask.textContent = splitTask[0];
                            divTask.className = 'col-task';
                            listItem.appendChild(divTask);

                        // Create "Update" div
                            const divUpdate = document.createElement('div');
                            divUpdate.className = 'col-update';
                            listItem.appendChild(divUpdate);

                        // Create "Move to/from today" button
                            const todayButton = document.createElement('button');
                            todayButton.textContent = 'T';
                            todayButton.className = 'col-update-buttons';
                            todayButton.addEventListener('click', () => {
                                if (settings[0] == 0 || settings[0] == 2) {
                                    let i = list == quadrant1 ? views[settings[0]][0] : list == quadrant2 ? views[settings[0]][1] : list == quadrant3 ? views[settings[0]][2] : views[settings[0]][3];
                                    todaysTasks.push(i[index]);
                                    i.splice(index, 1);
                                }
                                else if (settings[0] == 3) {
                                    todaysTasks.push(routineTasks[index]);
                                    routineTasks.splice(index, 1);
                                }
                                else {
                                    let i = splitTask[1] != "" && splitTask[3] == "/" ? allTasksQuadrant1 : splitTask[1] == "" && splitTask[3] == "/" ? allTasksQuadrant2 : splitTask[1] != "" && splitTask[3] == "" ? allTasksQuadrant3 : allTasksQuadrant4;
                                    i.push(todaysTasks[index]);
                                    todaysTasks.splice(index, 1);
                                }
                                saveTasks();
                                displayTasks();
                            })
                            divUpdate.appendChild(todayButton);

                        // Create "Move to/from routine" button
                            if (settings[0] != 3) { 
                                const routineButton = document.createElement('button');
                                routineButton.textContent = 'R';
                                routineButton.className = 'col-update-buttons';
                                routineButton.addEventListener('click', () => {
                                    if (settings[0] == 0 || settings[0] == 2) {
                                        let i = list == quadrant1 ? views[settings[0]][0] : list == quadrant2 ? views[settings[0]][1] : list == quadrant3 ? views[settings[0]][2] : views[settings[0]][3];
                                        routineTasks.push(i[index]);
                                        i.splice(index, 1);
                                    }
                                    else if (settings[0] == 1) {
                                        routineTasks.push(todaysTasks[index]);
                                        todaysTasks.splice(index, 1);
                                    }
                                    saveTasks();
                                    displayTasks();
                                })
                                divUpdate.appendChild(routineButton);
                            }

                        // Create "Archive/Unarchive" button
                            const archiveButton = document.createElement('button');
                            archiveButton.textContent = 'A';
                            archiveButton.className = 'col-update-buttons';
                            archiveButton.addEventListener('click', () => {
                                let i = list == quadrant1 ? views[settings[0]][0] : list == quadrant2 ? views[settings[0]][1] : list == quadrant3 ? views[settings[0]][2] : views[settings[0]][3];
                                if (settings[0] == 0) {
                                    let j = list == quadrant1 ? archivedTasksQuadrant1 : list == quadrant2 ? archivedTasksQuadrant2 : list == quadrant3 ? archivedTasksQuadrant3 : archivedTasksQuadrant4;
                                    j.push(i[index]);
                                    i.splice(index, 1);
                                }
                                else if (settings[0] == 1) {
                                    let i = splitTask[1] != "" && splitTask[3] == "/" ? archivedTasksQuadrant1 : splitTask[1] == "" && splitTask[3] == "/" ? archivedTasksQuadrant2 : splitTask[1] != "" && splitTask[3] == "" ? archivedTasksQuadrant3 : archivedTasksQuadrant4;
                                    i.push(todaysTasks[index]);
                                    todaysTasks.splice(index, 1);
                                }
                                else if (settings[0] == 2) {
                                    let j = list == quadrant1 ? allTasksQuadrant1 : list == quadrant2 ? allTasksQuadrant2 : list == quadrant3 ? allTasksQuadrant3 : allTasksQuadrant4;
                                    j.push(i[index]);
                                    i.splice(index, 1);
                                }
                                else if (settings[0] == 3) {
                                    let i = splitTask[1] != "" && splitTask[3] == "/" ? archivedTasksQuadrant1 : splitTask[1] == "" && splitTask[3] == "/" ? archivedTasksQuadrant2 : splitTask[1] != "" && splitTask[3] == "" ? archivedTasksQuadrant3 : archivedTasksQuadrant4;
                                    i.push(routineTasks[index]);
                                    routineTasks.splice(index, 1);
                                }
                                saveTasks();
                                displayTasks();
                            })
                            divUpdate.appendChild(archiveButton);

                        // Create "Edit" button
                            const editButton = document.createElement('button');
                            editButton.textContent = 'E';
                            editButton.className = 'col-update-buttons';
                            editButton.addEventListener('click', () => {
                                if (userInput.value != "") {
                                    alert("User input isn't empty");
                                    userInput.focus;
                                }
                                else {
                                    let i = list == quadrant1 ? views[settings[0]][0] : list == quadrant2 ? views[settings[0]][1] : list == quadrant3 ? views[settings[0]][2] : list == quadrant4 ? views[settings[0]][3] : settings[0] == 1 ? todaysTasks : routineTasks;
                                    // Split
                                        let j = i[index].split("|");
                                    // Concatinate
                                        let k = j[0];
                                        for (let l = 1; l < 4; l++) {
                                            k = k.concat(" | ", j[l]);
                                        }
                                    userInput.value = k;
                                    userInput.focus();
                                    i.splice(index, 1);
                                    saveTasks();
                                    displayTasks();
                                }
                            })
                            divUpdate.appendChild(editButton);

                        // Create "Delete" button
                            const deleteButton = document.createElement('button');
                            deleteButton.textContent = 'X';
                            deleteButton.className = 'col-update-buttons';
                            deleteButton.addEventListener("click", () => {
                                let i = list == quadrant1 ? views[settings[0]][0] : list == quadrant2 ? views[settings[0]][1] : list == quadrant3 ? views[settings[0]][2] : list == quadrant4 ? views[settings[0]][3] : settings[0] == 1 ? todaysTasks : routineTasks;
                                i.splice(index, 1);
                                saveTasks();
                                displayTasks();
                            });
                            divUpdate.appendChild(deleteButton);
                    }
                }
        }

    // Save to localstorage
        function saveTasks() {
            localStorage.setItem('todaysTasks', JSON.stringify(todaysTasks));
            localStorage.setItem('allTasksQuadrant1', JSON.stringify(allTasksQuadrant1));
            localStorage.setItem('allTasksQuadrant2', JSON.stringify(allTasksQuadrant2));
            localStorage.setItem('allTasksQuadrant3', JSON.stringify(allTasksQuadrant3));
            localStorage.setItem('allTasksQuadrant4', JSON.stringify(allTasksQuadrant4));
            localStorage.setItem('archivedTasksQuadrant1', JSON.stringify(archivedTasksQuadrant1));
            localStorage.setItem('archivedTasksQuadrant2', JSON.stringify(archivedTasksQuadrant2));
            localStorage.setItem('archivedTasksQuadrant3', JSON.stringify(archivedTasksQuadrant3));
            localStorage.setItem('archivedTasksQuadrant4', JSON.stringify(archivedTasksQuadrant4));
            localStorage.setItem('routineTasks', JSON.stringify(routineTasks));
        }

    // Drag & drop
        let draggedItemIndex = null;
        function handleDragStart(e) {
            draggedItemIndex = Array.from(this.parentNode.children).indexOf(this);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
        }
        function handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }
        function handleDrop(e) {
            e.preventDefault();
            this.classList.remove('drop-target');
            const targetItemIndex = Array.from(this.parentNode.children).indexOf(this);
            const list = this.parentNode;
            const lists = views[settings[0]];
            let listIndex;
            if (settings[0] === 0 || settings[0] === 2) {
                listIndex = list === quadrant1 ? 0 :
                            list === quadrant2 ? 1 :
                            list === quadrant3 ? 2 :
                            list === quadrant4 ? 3 : -1;
            } else if (settings[0] === 1 || settings[0] === 3) {
                listIndex = 0;
            }
            if (draggedItemIndex !== targetItemIndex && listIndex !== -1) {
                const taskArray = lists[listIndex];
                const [movedItem] = taskArray.splice(draggedItemIndex, 1);
                taskArray.splice(targetItemIndex, 0, movedItem);
                saveTasks();
                displayTasks();
            }
        }
        function handleDragEnd() {
            draggedItemIndex = null;
        }

    // Switch views
        function switchView(x) {
            if (x == 0) {
                switchView2('Eis', 'matrix', 0);
            }
            else if (x == 1) {
                switchView2('Tdy', 'singlelist', 1);
            }
            else if (x == 2) {
                switchView2('Arc', 'matrix', 2);
            }
            else if (x == 3) {
                switchView2('Rou', 'singlelist', 3);
            }
        }
        function switchView2(a, b, c) {
            
            // a = Highlight selected navbar button
                let e = document.querySelectorAll(".navbar-button");
                e.forEach(e => {
                    e.style.outline = 'none';
                    // e.style.backgroundColor = 'var(--color-primary)';
                });
                document.getElementById(a).style.outline = '1px solid var(--color-border)';
                // document.getElementById(a).style.backgroundColor = 'var(--color-tertiary)';

            // b = Matrix / Singlelist
                if (b == 'matrix') {
                    document.getElementById('view-singlelist').style.display = 'none';
                    document.getElementById('view-matrix').style.display = 'block';
                }
                else if ( b == 'singlelist') {
                    document.getElementById('view-matrix').style.display = 'none';
                    document.getElementById('view-singlelist').style.display = 'block';
                }

            // c = Save last viewed
                settings[0] = c;
                localStorage.setItem('settings', JSON.stringify(settings));
                displayTasks();
        }

    
    // Copy
        function copy() {
            let copyText = "";
            let i = settings[0];

            for (let j = 0; j < views[i].length; j++) {
                for (let k = 0; k < views[i][j].length; k++) {
                    let splitTask = views[i][j][k].split("|");
                    copyText += "\n- " + splitTask[0];
                }
                copyText += "\n";
            }

            const temporaryTextarea = document.createElement('textarea');
            temporaryTextarea.value = copyText;
            document.body.appendChild(temporaryTextarea);
            temporaryTextarea.select();
            temporaryTextarea.setSelectionRange(0, 99999); // For mobile devices
            document.execCommand('copy');
            document.body.removeChild(temporaryTextarea);
        }

    // Switch color modes
        function darkMode() {
            document.getElementById('darkMode').style.display = 'none';
            document.getElementById('lightMode').style.display = 'block';

            document.querySelector(':root').style.setProperty('--color-primary', 'hsl(0, 0%, 0%)');
            document.querySelector(':root').style.setProperty('--color-secondary', 'hsl(0, 0%, 10%)');
            document.querySelector(':root').style.setProperty('--color-tertiary', 'hsl(0, 0%, 5%)');
            // document.querySelector(':root').style.setProperty('--color-tertiary', 'hsl(125, 50%, 15%)');
            document.querySelector(':root').style.setProperty('--color-font', 'hsl(0, 0%, 100%)');
            document.querySelector(':root').style.setProperty('--color-border', 'hsl(0, 0%, 25%)');

            settings[1] = true;
            localStorage.setItem('settings', JSON.stringify(settings));
        }
        function lightMode() {
            document.getElementById('lightMode').style.display = 'none';
            document.getElementById('darkMode').style.display = 'block';
            
            document.querySelector(':root').style.setProperty('--color-primary', 'hsl(0, 0%, 90%)');
            document.querySelector(':root').style.setProperty('--color-secondary', 'hsl(0, 0%, 100%)');
            document.querySelector(':root').style.setProperty('--color-tertiary', 'hsl(0, 0%, 95%)');
            // document.querySelector(':root').style.setProperty('--color-tertiary', 'hsl(125, 50%, 80%)');
            document.querySelector(':root').style.setProperty('--color-font', 'hsl(0, 0%, 0%)');
            document.querySelector(':root').style.setProperty('--color-border', 'hsl(0, 0%, 75%)');

            settings[1] = false;
            localStorage.setItem('settings', JSON.stringify(settings));
        }

    // Replace
        /* function replace() {
            let replace = [allTasksQuadrant1, allTasksQuadrant2, allTasksQuadrant3, allTasksQuadrant4, todaysTasks, archivedTasksQuadrant1, archivedTasksQuadrant2, archivedTasksQuadrant3, archivedTasksQuadrant4]
            for (i = 0; i < 9; i++) {
                for (j = 0; j < replace[i].length; j++) {

                    // Split
                        let splitTask = replace[i][j].split(""); // Specify what I want to replace

                    // Concatinate
                        let concatTask = "";
                        let l = 0;
                        concatTask = concatTask.concat(" ", splitTask[0]).trim();
                        l++;
                        for (; l < splitTask.length; l++) {
                            concatTask = concatTask.concat("...", splitTask[l]); // Specify what I want to replace it by
                        }

                    // Save
                        replace[i][j] = concatTask;
                        saveTasks();
                }
            }
        } */

/******************************* Loops ********************************/

    // Display date, day & time
        setInterval(() => {

            let today = new Date();

            // Date
                switch(today.getMonth()) {
                    case 0:
                        monthRN = "JAN";
                        break;
                    case 1:
                        monthRN = "FEB";
                        break;
                    case 2:
                        monthRN = "MAR";
                        break;
                    case 3:
                        monthRN = "APR";
                        break;
                    case 4:
                        monthRN = "MAY";
                        break;
                    case 5:
                        monthRN = "JUN";
                        break;
                    case 6:
                        monthRN = "JUL";
                        break;
                    case 7:
                        monthRN = "AUG";
                        break;
                    case 8:
                        monthRN = "SEP";
                        break;
                    case 9:
                        monthRN = "OCT";
                        break;
                    case 10:
                        monthRN = "NOV";
                        break;
                    case 11:
                        monthRN = "DEC";
                        break;
                }
                let dateRN = today.getDate();
                document.getElementById('date').textContent = monthRN + " " + dateRN;

            // Day
                switch(today.getDay()) {
                    case 0:
                        dayRN = "SUN";
                        break;
                    case 1:
                        dayRN = "MON";
                        break;
                    case 2:
                        dayRN = "TUE";
                        break;
                    case 3:
                        dayRN = "WED";
                        break;
                    case 4:
                        dayRN = "THU";
                        break;
                    case 5:
                        dayRN = "FRI";
                        break;
                    case 6:
                        dayRN = "SAT";
                        break;
                }
                document.getElementById('day').textContent = dayRN;

            // Time
                let meridiemRN = "AM";
                let hourRN = today.getHours();
                switch(hourRN) {
                    case 0:
                        hourRN = "12";
                        break;
                    case 12:
                        meridiemRN = "PM";
                        break;
                    case 13:
                        hourRN = "1";
                        meridiemRN = "PM";
                        break;
                    case 14:
                        hourRN = "2";
                        meridiemRN = "PM";
                        break;
                    case 15:
                        hourRN = "3";
                        meridiemRN = "PM";
                        break;
                    case 16:
                        hourRN = "4";
                        meridiemRN = "PM";
                        break;
                    case 17:
                        hourRN = "5";
                        meridiemRN = "PM";
                        break;
                    case 18:
                        hourRN = "6";
                        meridiemRN = "PM";
                        break;
                    case 19:
                        hourRN = "7";
                        meridiemRN = "PM";
                        break;
                    case 20:
                        hourRN = "8";
                        meridiemRN = "PM";
                        break;
                    case 21:
                        hourRN = "9";
                        meridiemRN = "PM";
                        break;
                    case 22:
                        hourRN = "10";
                        meridiemRN = "PM";
                        break;
                    case 23:
                        hourRN = "11";
                        meridiemRN = "PM";
                        break;
                }
                let minutesRN = today.getMinutes();
                switch (minutesRN) {
                    case 0:
                        minutesRN = "00";
                        break;
                    case 1:
                        minutesRN = "01";
                        break;
                    case 2:
                        minutesRN = "02";
                        break;
                    case 3:
                        minutesRN = "03";
                        break;
                    case 4:
                        minutesRN = "04";
                        break;
                    case 5:
                        minutesRN = "05";
                        break;
                    case 6:
                        minutesRN = "06";
                        break;
                    case 7:
                        minutesRN = "07";
                        break;
                    case 8:
                        minutesRN = "08";
                        break;
                    case 9:
                        minutesRN = "09";
                        break;
                }
                document.getElementById('time').textContent = hourRN + ":" + minutesRN + " " + meridiemRN;

        }, 1000);

/*************************** EventListeners ***************************/

    // Note: In addEventListener, function(x) {} is same as (x) => {}

    // Keydown
        document.addEventListener("keydown", (e) => {

            // When userInput IS in focus
                if (e.target.id === 'userInput') {
                    switch (e.key) {

                        case "Escape":
                            e.preventDefault();
                            userInput.blur();
                            break;

                        case "Enter":
                            if (e.shiftKey) {
                                e.preventDefault();
                                userInput.value += "\n - "
                            }
                            else {
                                preprocessInput();
                            }
                            break;
                    }
                    return;
                }

            // When userInput is NOT in focus
                else {
                    switch (e.key) {

                        case "Enter":
                        case "Space":
                        case " ":
                            e.preventDefault();
                            userInput.focus();
                            break;

                        case "ArrowUp":
                            e.preventDefault();
                            settings[0] = 0;
                            switchView(settings[0]);
                            break;

                        case "ArrowDown":
                            e.preventDefault();
                            settings[0] = 3;
                            switchView(settings[0]);
                            break;

                        case "ArrowLeft":
                            e.preventDefault();
                            if (settings[0] > 0) {
                                settings[0]--;
                                switchView(settings[0]);
                            }
                            else {
                                settings[0] = 3;
                                switchView(settings[0]);
                            }
                            break;

                        case "ArrowRight":
                            e.preventDefault();
                            if (settings[0] < 3) {
                                settings[0]++;
                                switchView(settings[0]);
                            }
                            else {
                                settings[0] = 0;
                                switchView(settings[0]);
                            }
                            break;
                            
                        case "t":
                        case "T":
                            e.preventDefault();
                            if (settings[1]) {
                                lightMode();
                            }
                            else {
                                darkMode();
                            }
                            break;

                        // case "z":
                        // case "Z"
                        //     Undo edit, reorder, move to all/tdy/arc, delete (upto last 10)
                        //     break;
                        case "c":
                        case "C":
                            e.preventDefault();
                            copy();
                            break;
                    }
                    return;
                }
        })

    // UserInput
        userInput.addEventListener("focus", () => {
            if (userInput.value == "") {
                userInput.value = " |  |  | ";
            }
            setTimeout(() => {
                userInput.setSelectionRange(0, 0);
                userInput.focus();
            }, 0);
        });
        userInput.addEventListener("blur", () => {
            let x = userInput.value.split("|");
            let flag = 0;
            for (let i = 0; i < x.length; i++) {
                if (x[i].trim() != "") {
                    flag += 1;
                }   
            }
            if (flag == 0) {
                userInput.value="";
            }
        })
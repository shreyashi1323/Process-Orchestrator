$(document).ready(
    
    function() {

        $(".form-group-time-quantum").hide();

        $('#algorithmSelector').on('change', function() {
            if (this.value === 'optRR') {
                $(".form-group-time-quantum").show(1000);
            } else {
                $(".form-group-time-quantum").hide(1000);
            }
        });

        
        var processList = [];
        var originProcessList = [];

        $('#btnAddProcess').on('click', function() {
            var processID = $('#processID');
            var arrivalTime = $('#arrivalTime');
            var burstTime = $('#burstTime');

            if (processID.val() === '' || arrivalTime.val() === '' || burstTime.val() === '') {
                processID.addClass('is-invalid');
                arrivalTime.addClass('is-invalid');
                burstTime.addClass('is-invalid');
                return;
            }

            var process = {
                processID: parseInt(processID.val(), 10),
                arrivalTime: parseInt(arrivalTime.val(), 10),
                burstTime: parseInt(burstTime.val(), 10)
            }

            processList.push(process);
            originProcessList.push(process);

            $('#tblProcessList > tbody:last-child').append(
                `<tr>
                    <td id="tdProcessID">${processID.val()}</td>
                    <td id="tdArrivalTime">${arrivalTime.val()}</td>
                    <td id="tdBurstTime">${burstTime.val()}</td>
                </tr>`
            );

            processID.val('');
            arrivalTime.val('');
            burstTime.val('');
        });

        $('#btnCalculate').on('click', function() {

            if (processList.length == 0) {
                alert('Please insert some processes');
                return;
            }

            var selectedAlgo = $('#algorithmSelector').children('option:selected').val();

            if (selectedAlgo === 'optFCFS') {
                $("#tblResults td").remove(); 
                $("#ganttChart td").remove();
                firstComeFirstServed();
            }

            if (selectedAlgo === 'optSJF') {
                $("#tblResults td").remove();
                $("#ganttChart td").remove();    
                shortestJobFirst();
            }

            if (selectedAlgo === 'optSRTF') {
                $("#tblResults td").remove(); 
                $("#ganttChart td").remove();   
                shortestRemainingTimeFirst();
            }

            if (selectedAlgo === 'optRR') {
                $("#tblResults td").remove(); 
                $("#ganttChart td").remove(); 
                roundRobin();
            }
        });

        function firstComeFirstServed() {
            var time = 0;
            var queue = [];
            var completedList = [];

            while (processList.length > 0 || queue.length > 0) {
                addToQueue();
                while (queue.length == 0) {
                    time++;
                    addToQueue();
                }
                process = queue.shift();
                for (var i = 0; i < process.burstTime; i++) {
                    time++
                    addToQueue();
                }
                process.completedTime = time;
                process.turnAroundTime = process.completedTime - process.arrivalTime;
                process.waitingTime = process.turnAroundTime - process.burstTime;
                completedList.push(process);
            }

            function addToQueue() {
                for (var i = 0; i < processList.length; i++) {
                    if (time >= processList[i].arrivalTime) {
                        var process = {
                            processID: processList[i].processID,
                            arrivalTime: processList[i].arrivalTime,
                            burstTime: processList[i].burstTime
                        }
                        
                        processList.splice(i, 1);
                        queue.push(process);
                    }
                }
                
            }

            var i = 0;
            $.each(completedList, function(key, process) {
                
                $('#tblResults > tbody:last-child').append(
                    `<tr>
                        <td id="tdProcessID">${process.processID}</td>
                        <td id="tdArrivalTime">${process.arrivalTime}</td>
                        <td id="tdBurstTime">${process.burstTime}</td>
                        <td id="tdBurstTime">${process.completedTime}</td>
                        <td id="tdBurstTime">${process.waitingTime}</td>
                        <td id="tdBurstTime">${process.turnAroundTime}</td>
                    </tr>`
                );
                if (i === 0)
                {
                    $('#ganttChart > tbody:last-child').append(
                        `
                            <td id="gtdBurstTime">${process.arrivalTime}</td>
                        `
                    );
                }
                $('#ganttChart > tbody:last-child').append(
                    `
                        <td id="gtdProcessID">P${process.processID}</td>
                        <td id="gtdBurstTime">${process.completedTime}</td>
                    `
                );
                i++;
                
            });
            

       
            var avgTurnaroundTime = 0;
            var avgWaitingTime = 0;
            var maxCompletedTime = 0;

            $.each(completedList, function(key, process) {
                if (process.completedTime > maxCompletedTime) {
                    maxCompletedTime = process.completedTime;
                }
                avgTurnaroundTime = avgTurnaroundTime + process.turnAroundTime;
                avgWaitingTime = avgWaitingTime + process.waitingTime;
            });

            $('#avgTurnaroundTime').val(avgTurnaroundTime / completedList.length);
            $('#avgWaitingTime').val(avgWaitingTime / completedList.length);
            $('#throughput').val(completedList.length / maxCompletedTime);

            for(var index in originProcessList){
                processList[index] = originProcessList[index];
            }
            completedList = [];

        }

        function shortestJobFirst() {
            var completedList = [];
            var time = 0;
            var queue = [];

            while (processList.length > 0 || queue.length > 0) {
                addToQueue();
                while (queue.length == 0) {
                    time++;
                    addToQueue();
                }
                processToRun = selectProcess();
                for (var i = 0; i < processToRun.burstTime; i++) {
                    time++;
                    addToQueue();
                }
                processToRun.processID = processToRun.processID;
                processToRun.arrivalTime = processToRun.arrivalTime;
                processToRun.burstTime = processToRun.burstTime;
                processToRun.completedTime = time;
                processToRun.turnAroundTime = processToRun.completedTime - processToRun.arrivalTime;
                processToRun.waitingTime = processToRun.turnAroundTime - processToRun.burstTime;
                completedList.push(processToRun);
            }

            function addToQueue() {
                for (var i = 0; i < processList.length; i++) {
                    if (processList[i].arrivalTime === time) {
                        var process = {
                            processID: processList[i].processID,
                            arrivalTime: processList[i].arrivalTime,
                            burstTime: processList[i].burstTime
                        }
                        processList.splice(i, 1);
                        queue.push(process);
                    }
                }
            }

            function selectProcess() {
                if (queue.length != 0) {
                    queue.sort(function(a, b) {
                        if (a.burstTime > b.burstTime) {
                            return 1;
                        } else if (a.burstTime < b.burstTime) {
                            return -1;
                        }
                        else{
                            if(a.processID > b.processID){
                                return 1;
                            }
                            else{
                                return -1;
                            }
                        }
                    });
                }
                var process = queue.shift();
                return process;
            }

           
            var i = 0;
            $.each(completedList, function(key, process) {
                
                $('#tblResults > tbody:last-child').append(
                    `<tr>
                        <td id="tdProcessID">${process.processID}</td>
                        <td id="tdArrivalTime">${process.arrivalTime}</td>
                        <td id="tdBurstTime">${process.burstTime}</td>
                        <td id="tdBurstTime">${process.completedTime}</td>
                        <td id="tdBurstTime">${process.waitingTime}</td>
                        <td id="tdBurstTime">${process.turnAroundTime}</td>
                    </tr>`
                );
                if (i === 0)
                {
                    $('#ganttChart > tbody:last-child').append(
                        `
                            <td id="gtdBurstTime">${process.arrivalTime}</td>
                        `
                    );
                }
                $('#ganttChart > tbody:last-child').append(
                    `
                        <td id="gtdProcessID">P${process.processID}</td>
                        <td id="gtdBurstTime">${process.completedTime}</td>
                    `
                );
                i++;
                
            });

            

          
            var avgTurnaroundTime = 0;
            var avgWaitingTime = 0;
            var maxCompletedTime = 0;
            var throughput = 0;

            $.each(completedList, function(key, process) {
                if (process.completedTime > maxCompletedTime) {
                    maxCompletedTime = process.completedTime;
                }
                avgTurnaroundTime = avgTurnaroundTime + process.turnAroundTime;
                avgWaitingTime = avgWaitingTime + process.waitingTime;
            });

            $('#avgTurnaroundTime').val(avgTurnaroundTime / completedList.length);
            $('#avgWaitingTime').val(avgWaitingTime / completedList.length);
            $('#throughput').val(completedList.length / maxCompletedTime);

            for(var index in originProcessList){
                processList[index] = originProcessList[index];
            }
        }

        var i=0;
        function shortestRemainingTimeFirst() {
            var completedList = [];
            var time = 0;
            var queue = [];
            while (processList.length > 0 || queue.length > 0) {
                addToQueue();
                while (queue.length == 0) {
                    time++;
                    addToQueue();
                }
                selectProcessForSRTF();
                runSRTF();
            }

            function addToQueue() {
                for (var i = 0; i < processList.length; i++) {
                    if (processList[i].arrivalTime === time) {
                        var process = {
                            processID: processList[i].processID,
                            arrivalTime: processList[i].arrivalTime,
                            burstTime: processList[i].burstTime
                        }
                        processList.splice(i, 1);
                        queue.push(process);
                    }
                }
            }
            
            function selectProcessForSRTF() {
                if (queue.length != 0) {
                    queue.sort(function(a, b) {
                        if (a.burstTime > b.burstTime) {
                            return 1;
                        } else if (a.burstTime < b.burstTime) {
                            return -1;
                        }
                        else{
                            if(a.processID > b.processID){
                                return 1;
                            }
                            else{
                                return -1;
                            }
                        }
                    });
                    if(i === 0){
                        $('#ganttChart > tbody:last-child').append(
                            `
                                <td id="gtdBurstTime">${queue[0].arrivalTime}</td>
                            `
                        );
                    }
                    if (queue[0].burstTime == 1) {
                        process = queue.shift();
                        process.completedTime = time + 1;
                        completedList.push(process);
                        $('#ganttChart > tbody:last-child').append(
                            `
                                <td id="gtdProcessID">P${process.processID}</td>
                                <td id="gtdBurstTime">${process.completedTime}</td>
                            `
                        );

                    } else if (queue[0].burstTime > 1) {
                        process = queue[0];
                        queue[0].burstTime = process.burstTime - 1;
                        $('#ganttChart > tbody:last-child').append(
                            `
                                <td id="gtdProcessID">P${process.processID}</td>
                                <td id="gtdBurstTime">${time+1}</td>
                            `
                        );

                    }
                    i++;

                }
            }

            function runSRTF() {
                time++;
                addToQueue();
            }
            i=0;
           
            var TableData = [];
            $('#tblProcessList tr').each(function(row, tr) {
                TableData[row] = {
                    "processID": parseInt($(tr).find('td:eq(0)').text()),
                    "arrivalTime": parseInt($(tr).find('td:eq(1)').text()),
                    "burstTime": parseInt($(tr).find('td:eq(2)').text())
                }
            });

          
            TableData.splice(0, 1);

            TableData.forEach(pInTable => {
                completedList.forEach(pInCompleted => {
                    if (pInTable.processID == pInCompleted.processID) {
                        pInCompleted.burstTime = pInTable.burstTime;
                        pInCompleted.turnAroundTime = pInCompleted.completedTime - pInCompleted.arrivalTime;
                        pInCompleted.waitingTime = pInCompleted.turnAroundTime - pInCompleted.burstTime;
                    }
                });
            });

        
            $.each(completedList, function(key, process) {
                $('#tblResults > tbody:last-child').append(
                    `<tr>
                        <td id="tdProcessID">${process.processID}</td>
                        <td id="tdArrivalTime">${process.arrivalTime}</td>
                        <td id="tdBurstTime">${process.burstTime}</td>
                        <td id="tdBurstTime">${process.completedTime}</td>
                        <td id="tdBurstTime">${process.waitingTime}</td>
                        <td id="tdBurstTime">${process.turnAroundTime}</td>
                    </tr>`
                );
            });



           
            var avgTurnaroundTime = 0;
            var avgWaitingTime = 0;
            var maxCompletedTime = 0;
            var throughput = 0;

            $.each(completedList, function(key, process) {
                if (process.completedTime > maxCompletedTime) {
                    maxCompletedTime = process.completedTime;
                }
                avgTurnaroundTime = avgTurnaroundTime + process.turnAroundTime;
                avgWaitingTime = avgWaitingTime + process.waitingTime;
            });

            $('#avgTurnaroundTime').val(avgTurnaroundTime / completedList.length);
            $('#avgWaitingTime').val(avgWaitingTime / completedList.length);
            $('#throughput').val(completedList.length / maxCompletedTime);

            for(var index in originProcessList){
                processList[index] = originProcessList[index];
            }
        }
        i=0;
        function roundRobin() {
            var timeQuantum = $('#timeQuantum');
            var timeQuantumVal = parseInt(timeQuantum.val(), 10);
            if (timeQuantum.val() == '') {
                alert('Please enter time quantum');
                timeQuantum.addClass('is-invalid');
                return;
            }
            var completedList = [];
            var time = 0;
            var queue = [];

            while (processList.length > 0 || queue.length > 0) {
                addToQueue();
                while (queue.length == 0) {
                    time++;
                    addToQueue();
                }
                selectProcessForRR();
            }

            function addToQueue() {
                for (var i = 0; i < processList.length; i++) {
                    if (processList[i].arrivalTime === time) {
                        var process = {
                            processID: processList[i].processID,
                            arrivalTime: processList[i].arrivalTime,
                            burstTime: processList[i].burstTime
                        }
                        processList.splice(i, 1);
                        queue.push(process);
                    }
                }
            }
            function selectProcessForRR() {
                if (queue.length != 0) {
                    if(i === 0){
                        $('#ganttChart > tbody:last-child').append(
                            `
                                <td id="gtdBurstTime">${queue[0].arrivalTime}</td>
                            `
                        );
                    }
                    i++;
                    if (queue[0].burstTime < timeQuantumVal) {
                        process = queue.shift();
                        process.completedTime = time + process.burstTime;

                        for (var index = 0; index < process.burstTime; index++) {
                            time++;
                            addToQueue();
                        }
                        completedList.push(process);
                        $('#ganttChart > tbody:last-child').append(
                            `
                                <td id="gtdProcessID">P${process.processID}</td>
                                <td id="gtdBurstTime">${process.completedTime}</td>
                            `
                        );

                    } else if (queue[0].burstTime == timeQuantumVal) {
                        process = queue.shift();
                        process.completedTime = time + timeQuantumVal;
                        completedList.push(process);
                        $('#ganttChart > tbody:last-child').append(
                            `
                                <td id="gtdProcessID">P${process.processID}</td>
                                <td id="gtdBurstTime">${process.completedTime}</td>
                            `
                        );
                        for (var index = 0; index < timeQuantumVal; index++) {
                            time++;
                            addToQueue();
                        }
                    } else if (queue[0].burstTime > timeQuantumVal) {
                        process = queue[0];
                        queue[0].burstTime = process.burstTime - timeQuantumVal;
                        $('#ganttChart > tbody:last-child').append(
                            `
                                <td id="gtdProcessID">P${process.processID}</td>
                                <td id="gtdBurstTime">${time + timeQuantumVal}</td>
                            `
                        );
                        for (var index = 0; index < timeQuantumVal; index++) {
                            time++;
                            addToQueue();
                        }
                        process = queue.shift();
                        queue.push(process);
                       
                    }
                }
               
            }
            i=0;
           
            var TableData = [];
            $('#tblProcessList tr').each(function(row, tr) {
                TableData[row] = {
                    "processID": parseInt($(tr).find('td:eq(0)').text()),
                    "arrivalTime": parseInt($(tr).find('td:eq(1)').text()),
                    "burstTime": parseInt($(tr).find('td:eq(2)').text())
                }
            });

        
            TableData.splice(0, 1);

     
          
            TableData.forEach(pInTable => {
                completedList.forEach(pInCompleted => {
                    if (pInTable.processID == pInCompleted.processID) {
                        pInCompleted.burstTime = pInTable.burstTime;
                        pInCompleted.turnAroundTime = pInCompleted.completedTime - pInCompleted.arrivalTime;
                        pInCompleted.waitingTime = pInCompleted.turnAroundTime - pInCompleted.burstTime;
                    }
                    
                });
                
            });

         
            $.each(completedList, function(key, process) {
                $('#tblResults > tbody:last-child').append(
                    `<tr>
                        <td id="tdProcessID">${process.processID}</td>
                        <td id="tdArrivalTime">${process.arrivalTime}</td>
                        <td id="tdBurstTime">${process.burstTime}</td>
                        <td id="tdBurstTime">${process.completedTime}</td>
                        <td id="tdBurstTime">${process.waitingTime}</td>
                        <td id="tdBurstTime">${process.turnAroundTime}</td>
                    </tr>`
                );
               
            });
            
           
           

            var totalTurnaroundTime = 0;
            var totalWaitingTime = 0;
            var maxCompletedTime = 0;

            $.each(completedList, function(key, process) {
                if (process.completedTime > maxCompletedTime) {
                    maxCompletedTime = process.completedTime;
                }
                totalTurnaroundTime = totalTurnaroundTime + process.turnAroundTime;
                totalWaitingTime = totalWaitingTime + process.waitingTime;
            });

            $('#avgTurnaroundTime').val(totalTurnaroundTime / completedList.length);
            $('#avgWaitingTime').val(totalWaitingTime / completedList.length);
            $('#throughput').val(completedList.length / maxCompletedTime);

            for(var index in originProcessList){
                processList[index] = originProcessList[index];
            }
        }
        
    }
);
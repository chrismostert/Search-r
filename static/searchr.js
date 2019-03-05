$(function () {
    const begin_seconds = 300; // At how many seconds should the timer start.

    var init_mode = true;

    $('#experiment_explanation').load('static/experiment_explanation.html');
    $('#assignment_explanation').load('static/assignment_' + Cookies.get('assignment') + '.html');

    if (localStorage.selected == undefined) {
        localStorage.selected = "[]";
    }

    $(".card-subtitle").each(function (i, e) {
        var docid = $(this).text().replace(".", "").replace("\\n", "").replace(" ", "");
        $(this).parent().parent().parent().parent().addClass(docid);

    });


    $(".cardselect").click(function (e) {
        e.stopPropagation();
        var elem = $(this);
        var card = $(elem.parent().parent().parent().parent());
        var selectedList = $(".selectedlist");
        var selected = JSON.parse(localStorage.getItem("selected"));
        var title = card.find(".card-title").text();
        var docid = card.find(".card-subtitle").text().replace(".", "").replace("\\n", "").replace(" ", "");
        if (elem.is(':checked')) {
            card.addClass("border-primary");
            card.addClass("text-primary");

            selected.push({"title": title, "docid": docid});
            localStorage.setItem("selected", JSON.stringify(selected));
            selectedList.append("<li class=\"list-group-item " + docid + "\">" + title + "</li>");
            if (!init_mode) {
                log_activity("Select ("+docid+"): "+title);
            }
        } else {
            card.removeClass("border-primary");
            card.removeClass("text-primary");
            for (var i = 0; i < selected.length; i++) {
                if (selected[i].docid === docid) {
                    selected.splice(i,1);
                    break;
                }
            }
            var selector = '.' + docid;
            selectedList.find(selector).remove();
            localStorage.setItem("selected", JSON.stringify(selected));
            if (!init_mode) {
                log_activity("Remove ("+docid+"): "+title);
            }
        }
    });
    $(".cardselect").parent().parent().click(function () {
        $(this).find(".cardselect").trigger("click");
    });

    $(".revealer").parent().parent().click(function () {
        $(this).parent().find(".fulltext").toggle("fast");
        $(this).parent().find(".highlight").toggle("fast");
        var title = $(this).parent().find(".card-title").text();
        var docid = $(this).parent().find(".card-subtitle").text().replace(".", "").replace("\\n", "").replace(" ", "");
        log_activity("Toggle view article ("+docid+"): "+title);
    });

    $("button[type=submit]").click(function () {
        // $(this).html('<span>Loading...</span>');
        // $(this).attr("disabled","disabled");
    });

    var selected = JSON.parse(localStorage.getItem("selected"));
    for (var i = 0; i < selected.length; i++) {
        console.log("click " + "." + selected[i]["docid"]);
        $(".results").find("." + selected[i]["docid"]).find(".cardselect").trigger("click");
    }
    var selectedList = $(".selectedlist");
    selectedList.html("");

    for (var i = 0; i < selected.length; i++) {
        var docid = selected[i]["docid"];
        var title = selected[i]["title"];
        selectedList.append('<li class="list-group-item '+docid+' ">'+title+'</li>');
    }

    // The function which keeps track of time. It uses cookies, so works across pages.
    var timeoutHandler;

    function countdown() {
        var seconds = begin_seconds;
        if (typeof Cookies.get('seconds') !== "undefined") {
            seconds = Cookies.get("seconds");
        }
        console.log('Starting countdown from ' + seconds + ' seconds');

        function tick() {
            Cookies.set('seconds', seconds);
            seconds--;

            console.log(seconds + ' seconds left');

            if (seconds > 0) {
                timeoutHandler = setTimeout(tick, 1000);
            } else {
                log_activity('User is out of time! Click to start the next research topic.');
                alert('You are out of time! Click to start the next research topic.');
                done_assignment();
            }
        }

        tick();
    }

    $(document).ready(function () {
        if (Cookies.get('timer') === 'true') {
            countdown();
        }
    });

    // Start the experiment when the button is pressed.
    $("#start_experiment").click(function () {
        if(typeof Cookies.get('topic_1') === "undefined"){
            alert("Topics are not set!");
            return;
        }
        log_activity("Start experiment");
        log_activity("Start topic " + Cookies.get('topic_1'));
        Cookies.set('assignment', Cookies.get('topic_1'));
        //TODO misschien wil je hier liever de pagina refreshen?
        if(Cookies.get('timer') === 'true') {
            alert("The important debate has been rescheduled to tomorrow. " +
                "This means that you now have only limited time to prepare. " +
                "You only have 5 minutes of research time per topic. " +
                "Try to use the time as efficiently as possible! " +
                "The system will let you know when your are out of time and you need to move on to the next research topic." +
                "Click OK to start the experiment.");
        }
        // Clear all selected topics
        localStorage.setItem("selected", JSON.stringify([]));
        window.location.replace("/search?q=");    });

    $("#done_assignment").click(done_assignment);

    // Function which is called if the current assignment is done (or time has run out).
    function done_assignment() {
        console.log('Done with topic.');
        if (Cookies.get('timer') === 'true') {
            Cookies.set('seconds', begin_seconds);
            countdown();
        }
        // Clear all selected topics
        localStorage.setItem("selected", JSON.stringify([]));

        if (typeof Cookies.get('started_second_assignment') === "undefined") {
            log_activity("Start topic " + Cookies.get('topic_2'));
            Cookies.set('assignment', Cookies.get('topic_2'));
            Cookies.set('started_second_assignment', 'true');
            window.location.replace("/search?q=");
        } else {
            done_experiment();
        }

    }

    function done_experiment() {
        console.log('Done entire experiment.');
        alert('Thank you. The entire experiment is done.');
        clearCookies();
        window.location.replace("/");
    }

    function log_activity(message) {
        //$.post("log",{"message": message}, function (d) {}, "json")
        if(typeof Cookies.get('assignment') !== "undefined"){
            $.ajax({
            type: "POST",
            url: "log",
            data: JSON.stringify({"message": message}),
            contentType: 'application/json',
            });
        }
    }

    init_mode = false;

    function clearCookies() {
        Cookies.remove('started_second_assignment');
        Cookies.remove('assignment');
        Cookies.remove('topic_1');
        Cookies.remove('topic_2');
        Cookies.remove('timer');
    }

    // Function to set the settings of this experiment in cookies.
    $("#settings").click(function settings(){
        clearCookies();

        const use_timer = prompt("Use the timer? yes/no","");
        if (use_timer === "yes") {
            Cookies.set('timer', 'true');
        } else if (use_timer === "no") {
            Cookies.set('timer', 'false');
        } else {
            alert("Invalid input. Try again.");
            clearCookies();
            return;
        }

        const topic_1 = prompt("What is the first topic number? 1 / 2 / 3 / 4 . Order matters!","");
        if($.isNumeric(topic_1) && parseInt(topic_1) <= 4 && parseInt(topic_1) >= 0) {
            Cookies.set("topic_1", topic_1);
        } else {
            alert("Invalid input. Try again.");
            clearCookies();
            return;
        }
        const topic_2 = prompt("What is the second topic number? 1 / 2 / 3 / 4 . Order matters!","");
        if($.isNumeric(topic_2) && parseInt(topic_2) <= 4 && parseInt(topic_2) >= 0) {
            Cookies.set("topic_2", topic_2);
        } else {
            alert("Invalid input. Try again.");
            clearCookies();
            return;
        }
    });

});

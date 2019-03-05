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
            var idx = selected.indexOf(title);
            if (idx >= 0) {
                selected.splice(idx, 1);
            }
            var selector = '.' + docid;
            console.log(selector);
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



    // Toggle the timer cookie to indicate the use of the timer for this session.
    $("#toggle_timer").click(function () {
        timer_cookie = Cookies.get('timer');
        if (typeof timer_cookie === "undefined" || timer_cookie === 'false') {
            Cookies.set('timer', 'true');
            log_activity("The timer is now being used.");
            alert("The timer is now being used.");
            log_activity("Timer started")
        } else if (timer_cookie === 'true') {
            Cookies.set('timer', 'false');
            log_activity("The timer is now disabled.");
            alert("The timer is now disabled.");
            log_activity("Timer stopped")
        }
    });

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
                log_activity('User is out of time! Click to start the next assignment.');
                alert('You are out of time! Click to start the next assignment.');
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
        console.log('start experiment clicked');
        Cookies.set('assignment', 1);
        log_activity("start Assignment 1");
        //TODO misschien wil je hier liever de pagina refreshen?
        window.location.replace("/search?q=");
    });

    $("#done_assignment").click(done_assignment);

    // Function which is called if the current assignment is done (or time has run out).
    function done_assignment() {
        console.log('Done assignment.');
        if (Cookies.get('timer') === 'true') {
            Cookies.set('seconds', begin_seconds);
            countdown();
        }

        var current_assignment = parseInt(Cookies.get('assignment'));
        if (current_assignment < 4) {
            var newAssignment = parseInt(Cookies.get('assignment')) + 1
            Cookies.set('assignment', newAssignment);
            log_activity("start Assignment "+newAssignment);
            window.location.replace("/");
        } else {
            // TODO does this result in infinite recursion??
            done_experiment();
        }

    }

    function done_experiment() {
        console.log('Done entire experiment.');
        alert('Thank you. The entire experiment is done.');
        Cookies.set('timer', 'false');
        window.location.replace("/");
    }

    function log_activity(message) {
        //$.post("log",{"message": message}, function (d) {}, "json")
        $.ajax({
            type: "POST",
            url: "log",
            data: JSON.stringify({"message": message}),
            contentType: 'application/json',
        });
    }

    init_mode = false;

});

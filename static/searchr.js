$(function () {
    const begin_seconds = 5; // At how many seconds should the timer start.

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
        }
    });
    $(".cardselect").parent().parent().click(function () {
        $(this).find(".cardselect").trigger("click");
    });

    $(".revealer").parent().parent().click(function () {
        $(this).parent().find(".fulltext").toggle("fast");
        $(this).parent().find(".highlight").toggle("fast");
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
            alert("The timer is now being used.");
        } else if (timer_cookie === 'true') {
            Cookies.set('timer', 'false');
            alert("The timer is now disabled.");
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
        if (current_assignment <= 4) {
            Cookies.set('assignment', parseInt(Cookies.get('assignment')) + 1);
            window.location.replace("/search?q=");
        } else {
            done_experiment();
        }

    }

    function done_experiment() {
        console.log('Done entire experiment.');
        alert('Thank you. The entire experiment is done.');
        Cookies.set('timer', 'false');
        window.location.replace("/");
    }

});

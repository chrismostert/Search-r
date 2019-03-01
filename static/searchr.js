$(function () {
    if (localStorage.selected == undefined) {
        localStorage.selected = "[]";
    }

    $(".card-subtitle").each(function(i,e) {
        var docid = $(this).text().replace(".","").replace("\\n","").replace(" ","");
        $(this).parent().parent().parent().parent().addClass(docid);

    });


    $(".cardselect").click(function (e) {
        e.stopPropagation();
        var elem = $(this);
        var card = $(elem.parent().parent().parent().parent());
        var selectedList= $(".selectedlist")
        var selected = JSON.parse(localStorage.getItem("selected"));
        var title = card.find(".card-title").text();
        var docid = card.find(".card-subtitle").text().replace(".","").replace("\\n","").replace(" ","");
        if (elem.is(':checked')) {
            card.addClass("border-primary");
            card.addClass("text-primary");

            selected.push({"title":title, "docid":docid});
            localStorage.setItem("selected", JSON.stringify(selected));
            selectedList.append("<li class=\"list-group-item "+docid+"\">"+title+"</li>");
        } else {
            card.removeClass("border-primary");
            card.removeClass("text-primary");
            var idx = selected.indexOf(title);
            if (idx >= 0) {
                selected.splice(idx, 1);
            }
            var selector = '.'+docid;
            console.log(selector);
            selectedList.find(selector).remove();
            localStorage.setItem("selected", JSON.stringify(selected));
        }
    });
    $(".cardselect").parent().parent().click(function () {
        $(this).find(".cardselect").trigger("click");
    })

    $(".revealer").parent().parent().click(function () {
        $(this).parent().find(".fulltext").toggle("fast");
        $(this).parent().find(".highlight").toggle("fast");
    })

    $("button[type=submit]").click(function () {
        // $(this).html('<span>Loading...</span>');
        // $(this).attr("disabled","disabled");
    })

    var selected = JSON.parse(localStorage.getItem("selected"));
    for (var i =0; i < selected.length; i++) {
        console.log("click "+"."+selected[i]["docid"]);
        $(".results").find("."+selected[i]["docid"]).find(".cardselect").trigger("click");
    }

    $("#toggle_timer").click(function () {
        timer_cookie = Cookies.get('timer');
        if(typeof timer_cookie === "undefined") {
            Cookies.set('timer', 'true');
            alert("The timer is now being used.");
        } else if (timer_cookie === 'true') {
            Cookies.set('timer', 'false');
            alert("The timer is now disabled.");
        } else if (timer_cookie === 'false'){
            Cookies.set('timer', 'false');
            alert("The timer is now being used.");
        }
    })

})

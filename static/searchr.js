$(function () {
    console.log($(".cardselect"));

    $(".cardselect").parent().parent().click(function () {
        var elem = $(this);

        var card = $(elem.parent().parent().parent().parent());
        console.log(card);
        if (elem.is(':checked')) {
            card.addClass("border-primary");
            card.addClass("text-primary");
        } else {
            card.removeClass("border-primary");
            card.removeClass("text-primary");
        }
    });

    $(".revealer").parent().parent().click(function () {
        $(this).parent().find(".fulltext").toggle("fast");
        $(this).parent().find(".highlight").toggle("fast");
    })

    $("button[type=submit]").click(function () {
        // $(this).html('<span>Loading...</span>');
        // $(this).attr("disabled","disabled");
    })
})
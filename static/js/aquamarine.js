function GetParameterValues(param) {
    var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < url.length; i++) {
        var urlparam = url[i].split('=');
        if (urlparam[0] == param) {
            return urlparam[1];
        }
    }
}

// if a disableSidebar element is found, disable the sidebar
if (document.getElementById("disableSidebar")) cave.toolbar_setVisible(0);
else cave.toolbar_setVisible(1);

// when the page content is loaded, call onContentLoad()
document.addEventListener("DOMContentLoaded", function () {
    onContentLoad();
});

function onContentLoad() {
    // check if back button should be on or off
    if (history.length > 1 && !document.getElementById("disableBackButton")) cave.toolbar_setButtonType(1);
    else if (history.length <= 1 || document.getElementById("disableBackButton")) cave.toolbar_setButtonType(0);

    cave.snd_playBgm("BGM_CAVE_MAIN");

    // set the toolbar callbacks                  my menu                                  activity feed                            communities                              notifications
    cave.toolbar_setToolbarCallback(function () { onToolbarPress(5, true) }, function () { onToolbarPress(2, true) }, function () { onToolbarPress(3, true) }, function () { onToolbarPress(4, true) });

    // set back button callbacks
    cave.toolbar_setCallback(99, goBack);
    cave.toolbar_setCallback(1, goBack);
}

function onToolbarPress(number, setActive) {
    //alert("Guys. This is a certified\nAMOGUS!!!!\nmoment");
    if (setActive) {
        cave.toolbar_setActiveButton(number);
    }

    // switch statement for the 4 main toolbar buttons
    switch (number) {
        case 5:
            //alert("My Menu")
            alert("My Menu")
            break;
        case 2:
            //alert("Activity Feed")
            window.location.pathname = "/titles/activity_feed"
            break;
        case 3:
            //alert("Communities")
            $("body").empty();
            loadPage("../../../titles/show", "body")
            break;
        case 4:
            //alert("Notifications")
            window.location.pathname = "/titles/notifications"
            break;
        default:
            alert("what the flip did you press (default switch case message)")
            break;
    }
}

function create_empathy(id) {
    var xml = new XMLHttpRequest();
    xml.open("POST", "https://api.olv.nonamegiven.xyz/v1/posts/" + id.toString() + "/empathies");
    xml.send();

    xml.onreadystatechange = function () {
        if (xml.readyState == 4 && xml.status == 200) {
            if (JSON.parse(xml.responseText).result == "created") {
                $("#yeah_" + id.toString()).removeClass("yeah");
                $("#yeah_" + id.toString()).addClass("yeahed");
                $("#yeah_" + id.toString() + " span").text("Unyeah!");

                var e = $("#post_" + id.toString() + " .post_stats .post_stats_num .empathy_count").text();
                $("#post_" + id.toString() + " .post_stats .post_stats_num .empathy_count").text(Number(e) + 1)

                cave.snd_playSe("SE_OLV_MII_ADD");
            } else {
                $("#yeah_" + id.toString()).addClass("yeah");
                $("#yeah_" + id.toString()).removeClass("yeahed");
                $("#yeah_" + id.toString() + " span").text("Yeah!");

                var e = $("#post_" + id.toString() + " .post_stats .post_stats_num .empathy_count").text();
                $("#post_" + id.toString() + " .post_stats .post_stats_num .empathy_count").text(Number(e) - 1)

                cave.snd_playSe("SE_OLV_CANCEL");
            }
        } else if (xml.readyState == 4) {
            console.log("Empathy Failed!");

            alert(xml.statusText);
        }
    }
}

var lsc;
var mkr;
var lurl = [];
function load(url, element, canGoBack) {
    if (mkr == 1) {
        return;
    }

    $("#loading").show();
    mkr = 1;
    window.history.replaceState(null, "", url);

    $.ajax({
        type: "GET",
        url: url,
        cache : false,
        headers: {"pjax" : "on"},
        success: function (response) {
            $(element).append(response);
            $("#loading").hide();
            mkr = 0;
        },

        statusCode : {
            404: function() {
                lsc = 404;
                mkr = 0;
                $("#loading").hide();
            }
        }
    })
}

function loadPage(url, element, going_back) {
    if (mkr == 1) {
        return;
    }

    $("#loading").show();
    mkr = 1;

    if (!going_back) {
        location.pathname.replace("posts", "");
        lurl.push(location.pathname.replace("posts", ""))
    }

    window.history.replaceState(null, "", url);

    cave.transition_begin();
    $.ajax({
        type: "GET",
        url: url,
        headers: {"pjax" : "on"},
        cache : false,
        success: function (response) {
            $(window).off("scroll")
            $(element).append(response);
            $("#loading").hide();
            mkr = 0;

            if (lurl.length == 0) { cave.toolbar_setButtonType(0) } else { cave.toolbar_setButtonType(1); };

            cave.transition_end();
        },

        statusCode : {
            404: function() {
                lsc = 404;
                mkr = 0;
                $("#loading").hide();
            }
        }
    })
}

function goBack() {
    $("body").empty();
    loadPage(lurl[lurl.length - 1], "body", true);
    lurl.pop();

    if (lurl.length == 0) { cave.toolbar_setButtonType(0) } else { cave.toolbar_setButtonType(1); };
}

function grabMorePosts(id) {
    if (mkr == 1 || lsc == 404) {console.log("No More Posts!"); return;}

    var o = $(".posts_wrapper")[0].children.length;
    var l = 5;

    var t;
    var y;

    if (GetParameterValues("topic_tag")) {
        t = "&topic_tag=" + GetParameterValues("topic_tag");
    } else {
        t = "";
    }

    if (GetParameterValues("yeahed")) {
        y = "&yeahed=" + GetParameterValues("yeahed");
    } else {
        y = "";
    }

    load("../../../communities/"+id.toString()+"/posts?limit=" + l.toString() + "&offset=" + o.toString() + t.toString() + y.toString(), ".posts_wrapper")
}

function getPostsByTopicTag(id, t) {
    mkr = 0;
    lsc = 0;

    $(".posts_wrapper").empty();
    load("../../../communities/"+id.toString()+"/posts?&topic_tag="+t.toString(), ".posts_wrapper");

    $("#yeahed_posts").text("All Posts");
    $("#yeahed_posts").addClass("no_before");
    $("#yeahed_posts").attr("onclick", "getAllPosts("+id.toString()+");");
}

function getPostsByYeahed(id) {
    mkr = 0;
    lsc = 0;

    $(".posts_wrapper").empty();
    load("../../../communities/"+id.toString()+"/posts?yeahed=1", ".posts_wrapper");

    $("#yeahed_posts").text("All Posts");
    $("#yeahed_posts").addClass("no_before");
    $("#yeahed_posts").attr("onclick", "getAllPosts("+id.toString()+");");
}

function getAllPosts(id) {
    mkr = 0;
    lsc = 0;

    $(".posts_wrapper").empty();
    load("../../../communities/"+id.toString()+"/posts?limit=5", ".posts_wrapper");

    $("#yeahed_posts").text("Yeahed Posts");
    $("#yeahed_posts").removeClass("no_before");
    $("#yeahed_posts").attr("onclick", "getPostsByYeahed("+id.toString()+");");
}

function loadCommunity(e) {
    var id = $(e).attr("id");

    $("body").empty();

    loadPage("../../communities/"+id.toString()+"?limit=5", "body");
}

// just a little testing ban message
function banMessage() {
    cave.error_callFreeErrorViewer(20102, "You have been banned. MUAAHHAAHHAHAHAHAHHAHAHAHAHAHHAHAAHHAH!!!!!!!!!");
    cave.exitApp();
}
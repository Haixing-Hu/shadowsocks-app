let lastTitle = undefined;

let titleNamespaceURI = "http://mewchan.com/proj/query/ui/title";

let topHint = undefined;

const cancelScheduledHint = function (event) {

    if (topHint && topHint.hasClass("visible")) {
        topHint.removeClass("visible");
    }

    lastTitle = undefined;

};

document.addEventListener("mousedown", cancelScheduledHint);
document.addEventListener("mouseup", cancelScheduledHint);
document.addEventListener("mousewheel", cancelScheduledHint);

document.addEventListener("mousemove", function (event) {

    if (topHint && topHint.hasClass("visible")) {
        topHint.removeClass("visible");
    }

    let type = undefined;
    let title = undefined;

    let looper = 0;
    while (looper < event.path.length) {
        let dom = event.path[looper];
        if (dom instanceof Element) {
            let content = dom.getAttribute("title");
            if (content) {
                if (!title) {
                    type = "text";
                    title = content;
                }
                dom.removeAttribute("title");
                dom.setAttributeNS(titleNamespaceURI, "content", content);
            } else if (!title) {
                content = dom.getAttributeNS(titleNamespaceURI, "content");
                if (content) {
                    type = "text";
                    title = content;
                } else {
                    content = dom.getAttributeNS(titleNamespaceURI, "html");
                    if (content) {
                        type = "html";
                        title = content;
                    }
                }
            }
        }
        ++looper;
    }

    if (title) {
        lastTitle = {
            "time": Date.now(),
            "type": type,
            "title": title,
            "location": {
                "x": $.dom.getDevicePixels(event.pageX),
                "y": $.dom.getDevicePixels(event.pageY)
            }
        };
    } else {
        lastTitle = undefined;
    }

});

let titleTimer = $.timer(100, () => {

    if (!lastTitle || (Date.now() - lastTitle.time < 300)) {
        return;
    }

    if (topHint && topHint.hasClass("visible") && (topHint[0].lastTitle === lastTitle)) {
        return;
    }

    if (!topHint) {
        topHint = $("<ui-hint>");
        $("body").append(topHint);
    }

    let left = "auto";
    let right = "auto";
    if (lastTitle.location.x < $.dom.getDevicePixels(document.body.clientWidth) / 2) {
        left = `${lastTitle.location.x - $.dom.getDevicePixels(10)}px`;
    } else {
        right = `${$.dom.getDevicePixels(document.body.clientWidth) - lastTitle.location.x - $.dom.getDevicePixels(10)}px`;
    }

    let top = "auto";
    let bottom = "auto";
    if (lastTitle.location.y < $.dom.getDevicePixels(document.body.clientHeight) / 2) {
        top = `${lastTitle.location.y + $.dom.getDevicePixels(20)}px`;
    } else {
        bottom = `${$.dom.getDevicePixels(document.body.clientHeight) - lastTitle.location.y + $.dom.getDevicePixels(10)}px`;
    }

    topHint.attr({
        "content": lastTitle.title
    }).css({
        "left": left,
        "right": right,
        "top": top,
        "bottom": bottom,
    }).addClass("visible");

    topHint[0].lastTitle = lastTitle;

});

module.exports = {
    "attributes": [ "content", "x", "y" ]
};

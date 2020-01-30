module.exports = {
    "attributes": ["path", "caption", "resizable", "actions"],
    "listeners": {
        "onupdated": function (name, value) {

            if (name !== "path") {
                return;
            }

            let path = value;

            let { Window } = require(`${path}.js`);

            let [css, cssParameters, cssMixins, cssVariants] = $.tmpl.css($.res.load(`${path}.css`), {}, {
                "path": `${path}.css`
            });

            let xhtml = $.res.load(`${path}.xhtml`);
            if (css.trim()) {
                if (typeof xhtml === "string") {
                    xhtml = `<style>${css}</style>${xhtml}`;
                } else {
                    xhtml = xhtml.slice(0);
                    xhtml.unshift({
                        "prefix": "",
                        "name": ["style"],
                        "type": "element",
                        "namespace": $.tmpl.xhtmlNamespaceURI,
                        "attributes": {},
                        "children": [{
                            "type": "text",
                            "content": css
                        }]
                    });
                }
            }

            let parameters = { "tag": this, "name": name };
            if (Window.parameters) {
                Object.assign(parameters, Window.parameters);
            }

            let functors = {};
            if (Window.functors) {
                for (let key in Window.functors) {
                    functors[key] = (function (template, call, parameters, options) {
                        return Window.functors[key].apply(this.window, Array.prototype.slice.call(arguments, 4));
                    }).bind(this);
                }
            }

            let filler = $.tmpl(xhtml, parameters, {
                "functors": functors
            });

            filler.render(this.filler.query("#ui-window-clients"));

            this.window = new Window(this, filler);

        }
    },
    "methods": {
        "bringToFirst": function () {

            $.app(this).dom.bringViewToFirst(this);

        },
        "activateWindow": function () {

            $.app(this).dom.activateView(this);

        },
        "showWindow": function (noActivate) {

            $.app(this).dom.filler.query("shadow-root").append($(this));

            if (noActivate) {
                this.bringToFirst();
            } else {
                this.activateWindow();
            }

            requestAnimationFrame(() => {
                $(this).removeClass("hidden");
                $.app(this).dom.updateWindows();
            });

        },
        "hideWindow": function () {

            $(this).addClass("hidden");

            $.app(this).dom.activateTopView();

        },
        "closeWindow": function () {

            $(this).addClass("hidden");

            $.app(this).dom.activateTopView();

            if ($(this).attr("just-hide-when-close") !== "yes") {
                $.delay(500, () => {
                    that.detach();
                });
            }

        }
    },
    "functors": {
        "activateWindow": function () {
            this.activateWindow();
        },
        "hideOtherOverlays": function () {
            $.app(this).dom.hideOtherOverlays();
        },
        "startDraggingTitleBar": function (event) {

            if (!(event.buttons & 1)) {
                return;
            }

            let offsets = {
                "x": parseFloat($(this).css("left")) - $.dom.getDevicePixels(event.pageX),
                "y": parseFloat($(this).css("top")) - $.dom.getDevicePixels(event.pageY)
            };

            const onmousemove = (event) => {

                if (!(event.buttons & 1)) {
                    document.body.removeEventListener("mousemove", onmousemove);
                    document.body.removeEventListener("mouseup", onmouseup);
                    return;
                }

                $(this).css({
                    "left": Math.round(offsets.x + $.dom.getDevicePixels(event.pageX)),
                    "top": Math.round(offsets.y + $.dom.getDevicePixels(event.pageY))
                });

            };

            const onmouseup = (event) => {
                if (!(event.buttons & 1)) {
                    document.body.removeEventListener("mousemove", onmousemove);
                    document.body.removeEventListener("mouseup", onmouseup);
                }
            };

            document.body.addEventListener("mousemove", onmousemove);
            document.body.addEventListener("mouseup", onmouseup);

        },
        "startResizing": function (event) {

            if (!(event.buttons & 1)) {
                return;
            }

            let offsets = {
                "x": parseFloat($(this).css("width")) - $.dom.getDevicePixels(event.pageX),
                "y": parseFloat($(this).css("height")) - $.dom.getDevicePixels(event.pageY)
            };

            const onmousemove = (event) => {

                if (!(event.buttons & 1)) {
                    document.body.removeEventListener("mousemove", onmousemove);
                    document.body.removeEventListener("mouseup", onmouseup);
                    return;
                }

                $(this).css({
                    "width": Math.round(offsets.x + $.dom.getDevicePixels(event.pageX)),
                    "height": Math.round(offsets.y + $.dom.getDevicePixels(event.pageY))
                });

            };

            const onmouseup = (event) => {
                if (!(event.buttons & 1)) {
                    document.body.removeEventListener("mousemove", onmousemove);
                    document.body.removeEventListener("mouseup", onmouseup);
                }
            };

            document.body.addEventListener("mousemove", onmousemove);
            document.body.addEventListener("mouseup", onmouseup);

        },
        "closeWindow": function () {

            this.closeWindow();

        }
    }
};


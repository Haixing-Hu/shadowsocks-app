module.exports = {
    "attributes": [ "key", "value", "expanded", "resolver" ],
    "listeners": {},
    "functors": {
        "trigFoldingChanges": function () {
            $(this).trigger("foldingchange", {});
        },
        "getClassName": function () {

            if (this.resolver) {
                let className = this.resolver(this.value, "class");
                if ((typeof className === "string") && className) {
                    return className;
                }
            }

            return "";

        },
        "toggleFolder": function () {

            let expanded = $(this).attr("expanded");
            if (expanded === "yes") {
                expanded = "no";
            } else {
                expanded = "yes";
            }

            if (expanded === "yes") {
                let sublist = this.filler.query("#sublist")[0];
                if (sublist) {
                    let height = sublist.getCompleteHeight();
                    $(sublist).css("--complete-height", height + "px");
                }
                this.filler.query("#record").addClass("expanding");
                $.delay(500, () => {
                    this.filler.query("#record").removeClass("expanding");
                });
            }

            $(this).attr("expanded", expanded);
            for (let delay of [0, 50, 100, 200, 300, 400, 500]) {
                // TODO: make more elegant solution
                $.delay(delay, () => {
                    $(this).trigger("foldingchange", {});
                });
            }

        },
        "smartOpen": function () {

            if (this.resolver) {
                this.resolver(this.value, "open");
            }

        },
        "getTextValue": function () {

            let value = this.value;

            if (this.resolver) {
                value = this.resolver(value, "text");
            }

            if (value && (typeof value === "object")) {

                if (value instanceof Array) {

                    if (value.length === 0) {
                        return "[]";
                    }

                    if (value[0] && (typeof value[0] == "object") &&
                        value[0].constructor && value[0].constructor.name &&
                        (!Object.hasOwnProperty.call(value[0], "constructor"))) {
                        return `[${value[0].constructor.name} x ${value.length}]`;
                    }

                    return `[${typeof value[0]} x ${value.length}]`;

                }

                if (value.constructor && value.constructor.name &&
                    (!Object.hasOwnProperty.call(value, "constructor"))) {
                    return `<${value.constructor.name}>`;
                }

                return "<Object>";

            }

            return value + "";
        },
        "isExpandable": function () {
            return this.isExpandable();
        }
    },
    "methods": {
        "isExpandable": function () {
            let value = this.value;
            if (this.resolver) {
                value = this.resolver(value, "complex");
            }
            if (value && (typeof value === "object")) {
                return true;
            }
            return false;
        },
        "getTargetIDs": function () {

            let ids = Object.create(null);

            if (this.resolver) {
                let id = this.resolver(this.value, "link");
                if (id) {
                    if (!ids[id]) {
                        ids[id] = [];
                    }
                    ids[id].push($(this));
                }
            }

            if (this.isExpandable()) {
                let subids = this.filler.query("#sublist")[0].getTargetIDs();
                for (let id in subids) {
                    if (!ids[id]) {
                        ids[id] = [];
                    }
                    for (let dom of subids[id]) {
                        ids[id].push(dom);
                    }
                }
            }

            return ids;

        }
    }
};

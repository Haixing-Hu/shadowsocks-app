$.dom.escapeXML = function (text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};

const decode = function (text) {

    return text.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");

};

$.dom.unescapeXML = decode;

const node = function (xml) {

    let name = "";
    let attributes = {};
    let closed = false;

    let attribute = "";

    let codes = xml.split("=");

    let code = "";
    let looper = 0;
    while (looper < codes.length) {
        let parsed = false;
        code += codes[looper];
        let parts = code.split("\"");
        if (parts.length === 1) {
            code = code.trim();
            if (looper === 0) {
                name = code.split(/\s+/)[0];
                if (name[name.length - 1] === "/") {
                    name = name.slice(0, -1);
                    closed = true;
                }
                attribute = code.split(/\s+/)[1];
                code = "";
                parsed = true;
            } else {
                throw new Error("Invalid node");
            }
        } else if (parts.length === 3) {
            code = code.trim();
            if (code[0] !== "\"") {
                throw new Error("Invalid node");
            }
            let parts = code.slice(1).split("\"");
            let value = decode(parts[0]);
            attributes[attribute] = value;
            attribute = parts[1].trim();
            if (attribute === "/") {
                closed = true;
                if (looper !== codes.length - 1) {
                    throw new Error("Invalid node");
                }
            }
            code = "";
            parsed = true;
        }
        if (!parsed) {
            code += "=";
        }
        ++looper;
    }

    return {
        "name": name,
        "attributes": attributes,
        "closed": closed,
        "children": []
    };

};

const xml = function (xml) {

    let roots = [];

    var nodes = [roots];

    var code = "";

    xml.split("<").forEach((content, index) => {
        let parsed = false;
        if (index === 0) {
            parsed = true;
        }
        if (content) {
            code += content;
            if (code.slice(0, 3) === "!--") {
                var level = 0;
                code.split("<!--").forEach((comment) => {
                    ++level;
                    let comments = comment.split("-->");
                    level -= comments.length - 1;
                    if ((level == 0) && comments[comments.length - 1]) {
                        nodes[nodes.length - 1].push(decode(comments[comments.length - 1]));
                        parsed = true;
                        code = "";
                    }
                });
            } else {
                let befores = code.split(">");
                if (befores.length > 1) {
                    let looper = 0;
                    while (looper < befores.length) {
                        if (befores.slice(0, looper + 1).join(">").split("\"").length % 2 === 1) {
                            let code = befores.slice(0, looper + 1).join(">");
                            if (code[0] !== "/") {
                                let parsed = node(code);
                                nodes[nodes.length - 1].push(parsed);
                                if (!parsed.closed) {
                                    nodes.push(parsed.children);
                                }
                            } else {
                                let last = nodes[nodes.length - 2];
                                if (last[last.length - 1].name === code.slice(1)) {
                                    nodes.pop();
                                } else {
                                    console.log(code, last[last.length - 1]);
                                    throw new Error("Invalid xml");
                                }
                            }
                            let text = befores.slice(looper + 1).join(">");
                            if (text) {
                                nodes[nodes.length - 1].push(decode(text));
                            }
                            break;
                        }
                        ++looper;
                    }
                    parsed = true;
                    code = "";
                }
            }
        }
        if (!parsed) {
            code += "<";
        }
    });

    return roots;

};

$.dom.parseXML = xml;

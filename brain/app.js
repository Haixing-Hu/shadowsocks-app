let apps = @options("apps");

@servlet.get("/app-list", function (request, response) {

    this.break();

    response.headers["Content-Type"] = "text/plain";

    return @.async(function () {

        response.writer.end(Object.keys(apps).join("\n"), this.test);

    });

});

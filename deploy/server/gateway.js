(function () {
    'use strict';
    // Only this deployment's game client uses the gateway; no browser APIs are replaced.
    window.FyqstGateway = {
        http: function (port, params) {
            var routes = { '9901': 'login', '20001': 'game' };
            var route = routes[String(port)];
            if (!route) throw new Error('Unsupported game endpoint');
            return location.origin + '/_api/' + route + params;
        },
        socket: function (url, options) {
            var endpoint = new URL(url, location.href);
            var city = endpoint.pathname === '/city';
            options.path = '/_socket/' + (city ? 'city' : 'battle');
            options.forceNew = true;
            return location.origin + endpoint.pathname;
        }
    };
})();

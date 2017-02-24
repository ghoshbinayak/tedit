'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const Bell = require('bell');
const AuthCookie = require('hapi-auth-cookie');


server.connection({ port: 9000 });

server.register([Bell, AuthCookie], function (err) {

    if (err) {
        console.error(err);
        return process.exit(1);
    }

    var authCookieOptions = {
        password: 'cookie-encryption-password-hello',
        cookie: 'tedit-auth',
        isSecure: false
    };

    server.auth.strategy('tedit-cookie', 'cookie', authCookieOptions);

    var bellAuthOptions = {
        provider: 'github',
        password: 'github-encryption-password-hello', //Password used for encryption
        clientId: 'e0b4aa8b1fd63f0c3ed5',//'YourAppId',
        clientSecret: '47df94c832335d5c0a2f1ec236596533b8fcf17c',//'YourAppSecret',
        isSecure: false
    };

    server.auth.strategy('github-oauth', 'bell', bellAuthOptions);

    server.auth.default('tedit-cookie');

    server.route([{
            method: 'GET',
            path: '/login',
            config: {
                auth: 'github-oauth',
                handler: function (request, reply) {
                    if ( request.auth.isAuthenticated ) {
                        request.cookieAuth.set( request.auth.credentials );
                        return reply( 'Hello ' + request.auth.credentials.profile.username + ' :)' );
                    }

                    // Reach out to GitHub, ask the user for permission for their information
                    // if granted, response with their name
                    reply( 'Not logged in.. ' ).code(401);
                }
            }
        }, {
            method: 'GET',
            path: '/account',
            config: {
                auth: {
                    mode: 'optional'
                },
                handler: function (request, reply) {
                    if ( request.auth.isAuthenticated ) {
                        return reply(request.auth.credentials.profile);
                    }

                    reply( 'Not logged in..' ).code(401);
                }
            }
        }, {
            method: 'GET',
            path: '/',
            config: {
                auth: {
                    mode: 'optional'
                },
                handler: function (request, reply) {

                    if (request.auth.isAuthenticated) {
                        return reply('welcome back ' + request.auth.credentials.profile.username);
                    }

                    reply('hello stranger!');
                }
            }
        }, {
            method: 'GET',
            path: '/logout',
            config: {
                auth: false,
                handler: function (request, reply) {
                    request.cookieAuth.clear();
                    reply.redirect('/');
                }
            }
        }
    ]);
    server.start(function (err) {

        if (err) {
            console.error(err);
            return process.exit(1);
        }

       console.log('Server started at %s', server.info.uri);
    });
});
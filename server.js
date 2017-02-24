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
                    console.log(request.auth);
                    if ( request.auth.isAuthenticated) {
                        request.auth.session.set( request.auth.credentials );
                        return reply( 'Hello' + request.auth.credentials.profile.displayName );
                    }

                    // Reach out to GitHub, ask the user for permission for their information
                    // if granted, response with their name
                    reply( 'Not logged int.. ' ).code(401);
                }
            }
        }, {
            method: 'GET',
            path: '/account',
            config: {
                handler: function (request, reply) {

                    // Show the account information if the have logged in already
                    // otherwise, send a 491
                    reply();
                }
            }
        }, {
            method: 'GET',
            path: '/',
            config: {
                handler: function (request, reply) {

                    // If the user is authenticated reply with their user name
                    // otherwise, replay back with a generic message.
                    reply();
                }
            }
        }, {
            method: 'GET',
            path: '/logout',
            config: {
                handler: function (request, reply) {

                    // Clear the session information
                    reply.redirect();
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
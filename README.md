# Grouphone

Web client server for Grouphone that powers [grouphone.me](https://grouphone.me).

## Install

### Pre-requisites

- Install grouphone-api server, or get access to an existing Grouphone API server.
- Install `nodejs` and `npm`.

### Install Grouphone

- Clone the Grouphone repository: `git clone git@github.com:applait/grouphone`.
- Copy `config.js.sample` to `config.js` in the same directory.
- Change values in `config.js` if necessary.

#### Prep installation

Run these commands:

- `npm install` : This will install all the `node` dependencies.
- `npm run make` : This compiles JavaScript files into minified form.
- `npm run cert` : This generates self-signed certificates for use in local dev environment

### Start the Grouphone web client server

- `node server.js`

This will start Grouphone on the `APP_IP` and `APP_PORT` specified in the configuration.

### Run on different port

The port to run the server can be overriden by passing the port number
as third argument to `node server.js`. E.g. to run on port `80`, you
would do this:

```
# node server.js 80
```

However, it is preferred you use `config.js` to pass in those values.

## Development

If you trying to help with the development of the Grouphone web client server, take a look at [Development Guide](docs/development_guide.md).

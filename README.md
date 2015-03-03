# Grouphone

API, application layer and web client for Grouphone

## Install

- Give write permissions to the `storage` directory.
- Copy `config.js.sample` to `config.js` in the same directory.
- Change values in `config.js` if necessary.
- `npm install`
- `node server.js`

## Run on different port

The port to run the server can be overriden by passing the port number
as third argument to `node server.js`. E.g. to run on port `80`, you
would do this:

```
# node server.js 80
```

## API

### Request invite

**`POST` `/api/requestinvite/:email`**

#### Response

##### Success

HTTP Response status: `200`.

```json
{
    "message": "Ok",
    "status": 200
}
```

##### Error

HTTP Response status: `500`.

```json
{
    "message": "Something went wrong",
    "status": 500
}
```

##### Exists

HTTP Response status: `406`.

```json
{
    "message": "E-mail address already registered",
    "status": 406
}
```

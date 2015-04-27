# Grouphone Development Guide

## Architecture

Grouphone's architecture is built three main layers:

0. Grouphone web client server
1. Grouphone API
2. Grouphone media servers

This repository, the Grouphone web client server, forms the top-most layer in the architecture. It talks to Grouphone API through secure endpoints, and opens up media channels between the user and Grouphone media servers through a series of client-side and server-side negotiations.

No data is stored on this layer. The Grouphone API and the Grouphone media servers are expected to handle any storage required for their specific purposes. This abstracts security concerns and hides them one level deeper into the stack.

## Directory organization

- `./`- The root of the project includes `.gitignore`, `README.md`, `config.js.sample`, `package.json` and `server.js`.
- `./docs` - Developer documentation lives here.
- `./infosec`: Meant to store information security related things, like ssl certificates.
- `./libs`: The main action happens here.
    - `./routes`: The routes module handles all the publicly exposed routes. Take a look at `routes/index.js` to find out on what path each of them are mounted.
    - `./utils.js`: This module has all the commonly used utility functions
- `./scripts`: This has all the scripts necessary for repository upkeep/maintenance. Any build scripts go here.
- `./static`: This directory is mounted as a static file server. All static assets go here. Do not put sensitive information here.
- `./views`: All views go in here.

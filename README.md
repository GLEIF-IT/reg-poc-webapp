# reg-poc-webapp

UI for credential selection, login and upload.

## Architecture

### Webapp (this service)
The web app (UI front-end) uses Signify/KERIA for selecting identifiers and credentials:

```
yarn install; yarn dev run
```

Open http://localhost:5173/ in your browser.

### Verifier
The verifier uses [keripy](https://github.com/WebOfTRust/keripy) for verifying the requests.

See: [reg-poc-verifier](https://github.com/GLEIF-IT/reg-poc-verifier)

### Server
Provides the ability to:
* Log in using a vLEI ECR
* Upload signed files
* Check the status of an upload

See: [reg-poc-server](https://github.com/GLEIF-IT/reg-poc-server)

### Additional service
* KERI Witness Network
* vLEI server
* KERI Agent

The deployment architecture is demonstrated in [reg-poc](https://github.com/GLEIF-IT/reg-poc)


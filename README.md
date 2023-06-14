# reg-poc-webapp
to run the app use
```yarn install
yarn run dev
```
plase follow the https://github.com/WebOfTrust/signifypy/tree/main/scripts before spinning this up

It currently only retrieves the identifiers from a localhost keria (line 64 in App.tsx). 

To succesfully log in pick the first 'credential' as well. 

TODO: 

merge https://github.com/WebOfTrust/signify-ts/pull/49/files and get credentials 

call login() function and pass error message (url in line 66 in App.tsx)

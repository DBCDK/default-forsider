# This is the default forside service [http://default-forsider.febib-staging.svc.cloud.dbc.dk/hello])
This project was bootstrapped with Fastify-CLI.

# To run local
- download this repo
- npm install
- npm run build
- npm run start 
fastify will be listening on localhost:3000

# Endpoints for now 
 - GET / displays HEY PJO - other endpoints later
 - DELETE /wipeAll deletes all generated images

# To refresh ALL images
- Change working directory in configuration.yaml (on gitlab) - it is this one:         
- - name: IMAGE_DIR
    value: "covers"
- set the 'value' to something else - it will change the directory where images are stored and retrieved.
- REMEMBER to cleanup (to be nice) after you have changed the working dir like so:
- `curl -X DELETE https://default-forsider.dbc.dk/wipeAll`

# To use a custom Color scheme
- Go to smaug, to the configuration you are using
- Click "Edit configuration in JSON format":
-- ![image](https://github.com/DBCDK/default-forsider/assets/91877805/baaa5eb1-bed2-404d-a95d-10836886ebb8)
- Add a configuration, i.e.:
-- 
```
  "defaultForsider": {
    "colors": [
      {
        "background": "#E9B9AA"
      },
      {
        "background": "#D98481"
      },
      {
        "text": "#FFFFFF",
        "background": "#7892B5"
      },
      {
        "background": "#8CB9C0"
      },
      {
        "background": "#91B5A9"
      },
      {
        "background": "#EDCA7F"
      }
    ]
  },
```


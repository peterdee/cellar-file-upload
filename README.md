## Upload files to the Clever Cloud Cellar storage

This application implementes the following functionality:
- uploads the file to the [Clever Cloud Cellar](https://www.clever-cloud.com/doc/addons/cellar/) storage;
- downloads the file from the storage (proxy downloading).

**The `Cellar` service keys are required for this application!**

Stack: [`Node`](https://nodejs.org/en/), [`Express`](https://github.com/expressjs/express), [`AWS-SDK`](https://www.npmjs.com/package/aws-sdk).

Default application port: `1111`.

### Available APIs

- #### `/file [POST]`

POST-request that uploads the file to the Cellar storage.

Uploaded `FormData` should contain the file data in the `file` field, i. e.:

```javascript
const formData = new FormData();
formData.append('file', files[0]);

const response = await axios({
  data: formData,
  headers: {
    'Content-Type': 'multipart/formdata',
  },
  method: 'POST',
  url: 'http://localhost:1111/file',
});
```

- #### `/file/:name [GET]`

GET-request that downloads the file by the file name.

Request example:

```text
http://localhost:1111/file/file-1581780516810.jpg
```

- #### `/buckets [GET]`

GET-request that provides the list of the available buckets.

### Deploy

```bash
git clone https://github.com/peterdee/cellar-file-upload
cd ./cellar-file-upload
nvm use 13.8
npm i
```

### Launch

```bash
npm start
```

const AWS = require('aws-sdk');
const cors = require('cors');
const express = require('express');
const multer = require('multer');

// Cellar keys
const bucket = '<CELLAR_BUCKET>';
const host = '<CELLAR_HOST>';
const key = '<CELLAR_KEY_ID>';
const secret = '<CELLAR_KEY_SECRET>';

// set up the Cellar service
AWS.config.update({
  accessKeyId: key,
  secretAccessKey: secret,
});
const S3 = new AWS.S3({ endpoint: new AWS.Endpoint(host) });

const app = express();
const port = Number(process.env.PORT) || 1111;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

/**
 * Download the uploaded file (proxy downloading)
 * @returns {Promise<void>}
 */
app.get('/file/:name', async (req, res) => {
  try {
    // check the file name
    const { name = '' } = req.params;
    if (!name) {
      return res.status(400).send({ info: 'MISSING_FILE_NAME' });
    }

    // check the file in the bucket
    const headError = await new Promise((resolve) => S3.headObject(
      {
        Bucket: bucket,
        Key: name,
      },
      (error = null) => resolve(error),
    ));
    if (headError) {
      return res.status(400).send({ info: 'FILE_NOT_FOUND' });
    }

    // create the data stream
    const stream = S3.getObject({
      Bucket: bucket,
      Key: name,
    }).createReadStream();

    // pipe the data back to the client
    return stream.pipe(res);
  } catch (error) {
    return res.status(500);
  }
});

/**
 * Upload the file to the Cellar storage
 * @returns {Promise<void>}
 */
app.post('/file', upload.single('file'), async (req, res) => {
  try {
    // check the file
    if (!(req.file && req.file.originalname)) {
      return res.status(400).send({ info: 'MISSING_FILE' });
    }

    // create the key
    const Key = `file-${Date.now()}.${req.file.originalname.split('.').reverse()[0]}`;

    // upload
    await S3.putObject({
      Body: req.file.buffer,
      Bucket: bucket,
      Key,
    }).promise();

    // create the download link
    const downloadLink = `http://localhost:${port}/file/${Key}`;

    return res.status(200).send({
      data: {
        downloadLink,
      },
      info: 'OK',
    });
  } catch (error) {
    return res.status(500);
  }
});

/**
 * Get available buckets
 * @returns {Promise<void>}
 */
app.get('/buckets', async (req, res) => {
  try {
    const data = await S3.listBuckets().promise();
    return res.status(200).send({
      data,
      info: 'OK',
    });
  } catch (error) {
    return res.status(500);
  }
});

// handle all other requests
app.all('*', (req, res) => res.status(404).send({ info: 'NOT_FOUND' }));

// run the server
app.listen(port, () => console.log(`Running on ${port}`));

import * as msal from '@azure/msal-node';
import axios from 'axios'
import express from 'express';
import cors from 'cors'


import fs from 'fs'
import path from 'path'

const app = express();


app.use(express.json({limit: '50mb'}));
app.use(cors())


const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


// 1.
const siteId = `tmxin.sharepoint.com,9f9072d4-833c-4317-ae50-2f3a726a9fa7,90322319-75ff-4aad-a6ae-f95c6531065b`
const driveid = "b!1HKQnzyDF0OuUC86cmqfpxkjMpD_da1Kpq75XGUxBluKb9o8mFW8T5H5ikY2QyBW"

const tenantId = '777cfeff-82ef-45a9-a2b8-b78a830138d2';
const clientId = 'd56951cb-926c-44fc-93b2-3550492660d6';
// 2.
const clientSecret = 'uel8Q~IWhGiIFeM6U8iYZyNiTI-7_-S1hzXGuctx';
// const clientSecret = process.env.CLIENT_SECRET


const clientConfig = {
    auth: {
        clientId,
        clientSecret,
        // 3.
        authority: `https://login.microsoftonline.com/${tenantId}`
    }
};

// 4.
const authClient = new msal.ConfidentialClientApplication(clientConfig);

const queryGraphApi = async (path) => {
    // 5.
    const tokens = await authClient.acquireTokenByClientCredential({
        // 6.
        scopes: ['https://graph.microsoft.com/.default']
    });

    const rawResult = await axios.get(`${path}`, {
        headers: {
            // 7.
            'Authorization': `Bearer ${tokens.accessToken}`
        }
    });

    return await rawResult.data;
}


const graphAPIQuery = asyncHandler(async (req, res) => {

    const {site, list,email} = req.body

    // const sharePointSite = await queryGraphApi(`/sites/${site}/lists/${list}/items?$expand=fields&$filter=fields/UserEmailID eq 'technomax@taqeef.com'`);
    // const sharePointSite = await queryGraphApi(`/sites/taqeef.sharepoint.com,3dd0a8d8-306f-405c-a5d5-a2ae444e509a,567818a8-260f-4101-838c-0fddd99e7954/lists/8fa1c37c-6d47-4413-96f4-dee36c3382a3/items?$expand=fields&$filter=fields/UserEmailID eq 'technomax@taqeef.com`);
    // const sharePointSite = await queryGraphApi(`/sites/taqeef.sharepoint.com,3dd0a8d8-306f-405c-a5d5-a2ae444e509a,567818a8-260f-4101-838c-0fddd99e7954/lists/8fa1c37c-6d47-4413-96f4-dee36c3382a3/items?$expand=fields&$filter=fields/UserEmailID eq 'technomax@taqeef.com'`);
    const sharePointSite = await queryGraphApi('https://graph.microsoft.com/v1.0/sites/tmxin.sharepoint.com,9f9072d4-833c-4317-ae50-2f3a726a9fa7,90322319-75ff-4aad-a6ae-f95c6531065b/drives/b!1HKQnzyDF0OuUC86cmqfpxkjMpD_da1Kpq75XGUxBluKb9o8mFW8T5H5ikY2QyBW/root/children');

    // const sharePointSite = await queryGraphAxpi(`/sites/${site}/lists/${list}/items?$expand=fields`);
    res.json(sharePointSite)
})


// const graphAPIQuery1 = asyncHandler(async (req, res) => {

//     const {site, list,email} = req.body

//     // const sharePointSite = await queryGraphApi(`/sites/${site}/lists/${list}/items?$expand=fields&$filter=fields/UserEmailID eq 'technomax@taqeef.com'`);
//     // const sharePointSite = await queryGraphApi(`/sites/taqeef.sharepoint.com,3dd0a8d8-306f-405c-a5d5-a2ae444e509a,567818a8-260f-4101-838c-0fddd99e7954/lists/8fa1c37c-6d47-4413-96f4-dee36c3382a3/items?$expand=fields&$filter=fields/UserEmailID eq 'technomax@taqeef.com`);
//     // const sharePointSite = await queryGraphApi(`/sites/taqeef.sharepoint.com,3dd0a8d8-306f-405c-a5d5-a2ae444e509a,567818a8-260f-4101-838c-0fddd99e7954/lists/8fa1c37c-6d47-4413-96f4-dee36c3382a3/items?$expand=fields&$filter=fields/UserEmailID eq 'technomax@taqeef.com'`);
//     const sharePointSite = await queryGraphApi(site);

//     // const sharePointSite = await queryGraphAxpi(`/sites/${site}/lists/${list}/items?$expand=fields`);
//     res.json(sharePointSite)
// })

const graphAPIQuery1 = asyncHandler(async (req, res) => {
    try {
      const { site, list, email } = req.body;
  
      // Ensure the "uploads" directory exists
      const uploadDirectory = './uploads';
      if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, { recursive: true });
      }
  
      // Get the filename from the URL
      const fileName = path.basename('site');
  
      // Define the file path to save the downloaded file
      const filePath = path.join(uploadDirectory, fileName);
  
      // Download the file from the given URL
      const response = await axios({
        method: 'get',
        url: site,
        responseType: 'stream',
      });
  
      // Save the downloaded file to the specified directory
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
  
      // Handle events when the file is finished downloading
      writer.on('finish', () => {
        res.json({ message: 'File downloaded and saved successfully', filePath });
      });
  
      writer.on('error', (err) => {
        console.error('Error while saving the file:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error });
    }
  });
  


app.get('/graph-api', graphAPIQuery);
app.get('/download', graphAPIQuery1  )


app.listen(80, () => {
    return console.log(`Express is listening at http://localhost:}`);
});


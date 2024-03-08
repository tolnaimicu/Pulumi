import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as fs from 'fs';
import * as mime from 'mime';
import * as path from 'path';

// Create an AWS resource (S3 Bucket) with public-read ACL
const bucket = new aws.s3.Bucket("my-bucket", {
    acl: "public-read", // Set the ACL to public-read
    website: {
        indexDocument: "index.html",
    },
});

// Read the 'www' directory and upload its contents as bucket objects
const files = fs.readdirSync("www");
files.forEach(file => {
    const filePath = path.join("www", file);
    let contentType = mime.getType(filePath) || undefined;

    // Ensure the Content-Type for HTML files is set to 'text/html'
    if (path.extname(file) === '.html') {
        contentType = 'text/html';
    }

    new aws.s3.BucketObject(file, {
        acl: "public-read", // Set the ACL to public-read for each object
        bucket: bucket.id, // Reference the bucket ID
        key: file, // Use the file name as the key
        source: new pulumi.asset.FileAsset(filePath), // Use FileAsset to upload file content
        contentType: contentType, // Set the MIME type of the file
    });
});

// Export the name of the bucket and the website endpoint
export const bucketName = bucket.id;
export const bucketURL = pulumi.interpolate`${bucket.websiteEndpoint}`;

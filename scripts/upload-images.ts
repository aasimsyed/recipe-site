import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import { writeFileSync } from 'fs'

dotenv.config()

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
}

interface CloudinaryResponse {
  resources: CloudinaryResource[];
}

const images = [
  {
    name: 'carbonara',
    url: 'https://res.cloudinary.com/dujkb1y9j/image/upload/v1738871996/recipe-site/carbonara.jpg'
  },
  {
    name: 'lava-cake',
    url: 'https://res.cloudinary.com/dujkb1y9j/image/upload/v1738871997/recipe-site/lava-cake.jpg'
  },
  {
    name: 'buddha-bowl',
    url: 'https://res.cloudinary.com/dujkb1y9j/image/upload/v1738871998/recipe-site/buddha-bowl.jpg'
  }
];

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadAndListImages() {
  try {
    // First upload all images
    const uploadPromises = images.map(image => 
      cloudinary.uploader.upload(image.url, {
        public_id: `recipe-site/${image.name}`,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        transformation: [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      })
    );

    await Promise.all(uploadPromises);
    console.log('All images uploaded successfully');

    // Then list all images to get their URLs
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'recipe-site',
      max_results: 10
    }) as CloudinaryResponse;
    
    const uploadResults = result.resources.map((resource: CloudinaryResource) => ({
      name: resource.public_id.split('/').pop() || '',
      url: resource.secure_url,
      publicId: resource.public_id
    }));

    // Write the URLs to a file
    writeFileSync(
      'prisma/cloudinary-urls.json', 
      JSON.stringify(uploadResults, null, 2)
    );

    console.log('Image URLs have been updated');
  } catch (error) {
    console.error('Failed:', error);
  }
}

uploadAndListImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  }); 
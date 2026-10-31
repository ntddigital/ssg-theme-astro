import * as fs from 'fs';
import * as path from 'path';


interface ImageInfo {
  src: string;
  name: string;
}

export function getImagesFromFolders(folders: string): ImageInfo[] {
  const folderPaths = folders.split(',').map(folder => {
    // 如果路径没有以 /public 开头，则自动补上
    if (!folder.startsWith('/public')) {
      return path.join('public', folder.trim());
    }
    return folder.trim();
  });
  
  let images: ImageInfo[] = [];

  folderPaths.forEach(folderPath => {
    const imagesDir = path.join(process.cwd(), folderPath);
    try {
      const fileNames = fs.readdirSync(imagesDir);

      const folderImages = fileNames
        .filter(fileName => fileName !== '.DS_Store') // 过滤掉 .DS_Store 文件
        .map(fileName => ({
          src: path.join(folderPath, fileName),
          name: formatFileName(fileName),
        }));

      images = images.concat(folderImages);
    } catch (err) {
      // console.error(`Failed to read directory ${imagesDir}:`, err);
    }
  });

  return images;
}

function formatFileName(fileName: string): string {

  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");

  // replace 001_,002_... with ""
  const formattedName = nameWithoutExtension.replace(/^\d{3}_/, "")

  return formattedName;
}

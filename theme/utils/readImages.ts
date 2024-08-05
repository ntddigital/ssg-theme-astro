// import fs from 'fs';
// import path from 'path';

// export function getImagesFromFolder(folderPath: string) {
//   const imagesDir = path.join(process.cwd(), folderPath);
//   const fileNames = fs.readdirSync(imagesDir);

//   const images = fileNames
//     .filter(fileName => fileName !== '.DS_Store')  // Filter out .DS_Store files
//     .map(fileName => ({
//       src: path.join(folderPath, fileName),
//       name: formatFileName(fileName),
//     }));

//   return images;
// }

// function formatFileName(fileName: string) {
//   // Remove the file extension
//   const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");

//   // Replace all _ with spaces
//   const formattedName = nameWithoutExtension.replace(/[_]/g, " ");

//   // Capitalize the first letter of each word
// //   const capitalized = formattedName.replace(/\b\w/g, char => char.toUpperCase());

//   return formattedName;
// }

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
      console.error(`Failed to read directory ${imagesDir}:`, err);
    }
  });

  return images;
}

function formatFileName(fileName: string): string {
  // 移除文件扩展名
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");

  // 将所有 _ 替换为空格
  const formattedName = nameWithoutExtension.replace(/[_]/g, " ");

  return formattedName;
}

import fs from "fs";
import path from "path";
import astroConfig from "../../../astro.config.mjs";

function generateSiteMap() {
  if (!astroConfig?.site) return;

  // get the current date and format it as YYYY-MM-DD
  function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // generate all page paths
  function getAllPages(directory) {
    const pagePaths = [];

    function traverseDir(currentPath, baseUrl = "") {
      const files = fs.readdirSync(currentPath);

      files.forEach((file) => {
        const fullPath = path.join(currentPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          traverseDir(fullPath, path.join(baseUrl, file));
        } else if (file.endsWith(".astro") || file.endsWith(".md")) {
          // generate URL paths by removing the 'src/pages' part from the file paths

          const urlPath = path
            .join(baseUrl, file)
            .replace(/index\.(astro|md)$/, "") // remove the index.astro or index.md part from the paths
            .replace(/\.(astro|md)$/, ""); // remove the .astro or .md file extensions from the generated paths
          pagePaths.push(urlPath === "" ? "/" : `/${urlPath}`);
        }
      });
    }

    traverseDir(directory);
    return pagePaths;
  }

  function getImagesFromFolders(folders) {
    let images = [];

    folders.forEach((folder) => {
      const folderPath = path.join("public", folder);
      if (fs.existsSync(folderPath)) {
        const fileNames = fs.readdirSync(folderPath);
        const folderImages = fileNames
          .filter((fileName) => fileName !== ".DS_Store")
          .map((fileName) => ({
            src: `${astroConfig.site}/${folder}/${fileName}`,
            name: formatFileName(fileName), // generate file name
          }));
        images = images.concat(folderImages);
      }
    });

    return images;
  }

  function formatFileName(fileName) {
    // Remove the file extension
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");

    // Replace all _ with spaces
    const formattedName = nameWithoutExtension.replace(/[_]/g, " ");

    // Capitalize the first letter of each word
    const capitalized = formattedName.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );

    return capitalized;
  }

  function generateSitemap() {
    const currentDate = getCurrentDate();
    const pagesDir = path.join(process.cwd(), "website", "pages");
    const pages = getAllPages(pagesDir).map((url) => ({
      url,
      lastmod: currentDate,
    }));

    const galleryFolders = [
      "gallery",
      "gallery1",
      "gallery2",
      "gallery3",
      "gallery4",
      "gallery5",
      "gallery6",
    ];
    const images = getImagesFromFolders(galleryFolders);
    const videoNamespace = astroConfig?.videoUrl ? ' xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"' : '';
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
       xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ${videoNamespace}>
    ${pages
      .map(
        (page) => `
      <url>
        <loc>${astroConfig.site}${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        ${
          images.length > 0 
            ? images
                .map(
                  (image) => `<image:image>
          <image:loc>${image?.src.replace(/w:/g, "w/")
                            .replace(/w:o/g, "w/o").replace(/&/g, '%26')}</image:loc>
          <image:title>${image?.name
            .replace(/^\d{3}[_\s]*/, "")
            .replace(/^[_\s]+/, "")
            .replace(/__/g, " ").replace(/w:/g, "w/")
                            .replace(/w:o/g, "w/o")}</image:title>
        </image:image>`
                )
                .join("")
            : ""
        }
             ${
          astroConfig?.videoUrl
            ? `<video:video>
              <video:content_loc>${astroConfig?.videoUrl}</video:content_loc>
              <video:thumbnail_loc>${astroConfig?.videoThumbnailUrl}</video:thumbnail_loc>
              <video:title>${astroConfig?.videoTitle}</video:title>
              <video:description>${astroConfig?.videoDesc}</video:description>
            </video:video>`
            : ""
        }
      </url>`
      )
      .join("")}
  </urlset>`;

    return sitemap;
  }

  function writeSitemapToPublicFolder() {
    const sitemap = generateSitemap();
    const publicPath = path.join(process.cwd(), "public", "sitemap.xml");

    fs.writeFileSync(publicPath, sitemap, "utf-8");
  }

  writeSitemapToPublicFolder();
}
generateSiteMap();

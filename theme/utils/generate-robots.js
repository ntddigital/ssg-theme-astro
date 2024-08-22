import fs from "fs";
import path from "path";
import astroConfig from "../../../astro.config.mjs";

function generateRobots() {
  if (!astroConfig?.site) return;

  // To get the current date and format it as YYYY-MM-DD
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

  // check if a folder (directory) exists
  function checkFoldersExist(folders) {
    const existingFolders = [];
    folders.forEach((folder) => {
      const folderPath = path.join(process.cwd(), "public", folder);
      if (fs.existsSync(folderPath)) {
        existingFolders.push(folder);
      }
    });
    return existingFolders;
  }

  // get sitemap URL
  function getSitemapUrl() {
    return `${astroConfig.site}/sitemap.xml`;
  }

  function generateRobotsTxt() {
    const pagesDir = path.join(process.cwd(), "website", "pages");
    const pages = getAllPages(pagesDir);

    const galleryFolders = [
      "gallery",
      "gallery1",
      "gallery2",
      "gallery3",
      "gallery4",
      "gallery5",
      "gallery6",
    ];
    const existingFolders = checkFoldersExist(galleryFolders);

    let allowRules = pages.map((page) => `Allow: ${page}$`).join("\n");

    if (existingFolders.length > 0) {
      const galleryAllowRules = existingFolders
        .map((folder) => `Allow: /${folder}/`)
        .join("\n");
      allowRules += `\n${galleryAllowRules}`;
    }

    const robotsTxtContent = `User-agent: *\n${allowRules}\nAllow: sitemap.xml\nDisallow: /\nSitemap: ${getSitemapUrl()}`;

    return robotsTxtContent.trim();
  }

  function writeRobotsTxtToFile() {
    const robotsTxtContent = generateRobotsTxt();
    const publicPath = path.join(process.cwd(), "public", "robots.txt");
    fs.writeFileSync(publicPath, robotsTxtContent, "utf-8");
  }

  writeRobotsTxtToFile();
}
generateRobots();

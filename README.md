# ssg-theme-astro

Shared Astro theme for the restaurant websites in the `nclients` GitHub organisation (about 90 sites).
Each site is its own repository. The theme is included in every site as a git submodule.

## How a site uses the theme

- The theme is checked out at `theme/` in the site repository and registered as an npm workspace
  (`"workspaces": ["theme"]` in the site's `package.json`).
- The site's `tailwind.config.mjs` imports the theme's Tailwind config: `import config from "ssg-theme-astro/tailwind"`.
- Pages are Markdown files in `website/pages/` (`index.md` is the home page, other languages live in sub folders such as
  `zh-tw/` or `zh-cn/`). Their front matter starts with `layout: "ssg-theme-astro/layouts/main.astro"` and holds all content.
- Images used by `gallery` sections are read from `public/<folderPath>/` at build time.

### Upgrading a site

```bash
cd <site>/theme && git fetch && git checkout <commit>   # then commit the changed "theme" pointer in the site
cd .. && npm ci && npm run build                         # the build also runs `astro check`
```

Every site pins its own theme commit, so a change in this repository only reaches a site after that site upgrades.

## Code layout

| Path | Purpose |
|---|---|
| `theme/layouts/main.astro` | Page shell: `<head>` metadata, structured data (JSON-LD), skip links, renders `sections` in order |
| `theme/components/` | One component per section type, plus Header, Footer and the legal pages |
| `theme/components/ui/` | Buttons and the go-to-top link |
| `theme/utils/` | `cn` (class merging), `readImages` (gallery folder reader), `generate-sitemap.js`, `generate-robots.js` |
| `theme/style/global.css` | Skip-link styles and the spacing / rounded rules that must load after Tailwind (see the comment at the top of the file) |
| `tailwind.config.mjs` | Shared Tailwind config |

`astro.config.mjs`, `tsconfig.json` and `package.json` at the repository root exist for working on the theme on its own.
The sites use their own copies.

## Page front matter

### Site-wide fields (read from every page)

| Field | Meaning |
|---|---|
| `title` | Restaurant name, used for the page title, alt texts and legal pages |
| `tag` | Google Tag Manager id. Also switches on the analytics sections of the privacy and cookie pages |
| `googleSiteVerification` | Search Console verification token |
| `logo` | Logo file in `public/` |
| `primaryColor`, `primaryColorScheme` | Brand colour for buttons and the banner, and whether text on it is `dark` (white text) or `light` (black text) |
| `secondaryColor`, `secondaryColorScheme` | Same for secondary buttons |
| `tel`, `trackingNum` | Phone number shown in header and map. `trackingNum` replaces `tel` in the header link |
| `address`, `email`, `creationDate` | Used by the privacy, cookie and accessibility pages |
| `arbitrationLocation` | Used by the terms page |
| `cuid`, `ruid` | Online-ordering widget ids (read by the order buttons) |
| `banner` | Optional top bar: `text` (list of `boldText` / `text` / `smText`) |
| `header`, `footer` | See below |
| `seo` | See below |
| `sections` | Ordered list of page sections |

`favicon`, `orderOnlineLink` and `tableReservationLink` are present in most sites but this theme does not read `favicon` or
`tableReservationLink`. `orderOnlineLink` is used by the promo modal.

### `header`

`menu` (list of `text` / `link`), `bgColor`, `bgOpacity`, `menuTextColor`, `logoSize`, `logoSizeOnMobile`,
`textAfterLogo` (`text`, `size`, `color`), `showTextAfterLogoOnMobile`, `title`, `addTelBtn`, `telTextColor`,
`addOrderOnlineBtn`, `addTableReservationBtn`, `orderOnlineBtnInsteadText`,
`otherBtnInsteadText` + `otherBtnHref`, `otherBtn1InsteadText` + `otherBtn1Href`, `otherBtn2InsteadText` + `otherBtn2Href`.

### `footer`

`menu` (list of `text` / `link`), `isLogo`, `logoSize`, `logoSizeOnMobile`, `bgImg`, `bgType`, `bgColor`, `bgOpacity`,
`textColor`, `noMarginTop`, `openingHours` (+ `openingHoursInsteadText`), `address` (list of `address` / `url`,
+ `addressInsteadText`), social links `FB` / `FBLink`, `IG` / `IGLink`, `X` / `XLink`, `youtube` / `youtubeLink`,
`yelp` / `yelpLink`, `doorDash` / `doorDashLink`, `uberEats` / `uberEatsLink`, `paymentMethod` (list of names)
+ `acceptedPaymentMethodsInsteadText`, `privacy` / `terms` (set `false` to hide the link), `cookie` (set `true` to show the link),
`hideBestFoodToday`.

### `seo`

`metaTitle`, `metaDescription`, `keywords`, `canonicalHref`, `img`, `thisPageUrl`, `locale` (for example `en_US`, `zh_TW`;
becomes the `<html lang>`), and the restaurant structured data: `name`, `images`, `address`, `geo`, `telephone`, `url`,
`servesCuisine`, `priceRange`, `openingHours`, `acceptsReservations`, `paymentAccepted`, `currenciesAccepted`, `review`,
`starRating`, `hasMenuSection`, `offers`.

No new content fields are needed for language support. Built-in labels (skip links, "Go to top", menu and banner buttons,
star ratings, "(opens in a new tab)", footer headings and the like) are English by default and switch to Chinese when the
page is Chinese: `seo.locale` if set, otherwise a `/zh...` folder in the URL (`utils/lang.ts`). Text you write in the
content (button text, `...InsteadText`, titles) is always shown as written.

## Section types

Every section has `type`. Most also accept `id` (anchor), `noMarginTop`, `title` (list of lines) and `description` (list of paragraphs).
A section type that is not in this list renders nothing.

| `type` | Component | Main fields |
|---|---|---|
| `hero`, `feature` | `Feature.astro` | `sectionType` (`imgBg`, `imgWithText` or `video`), `bgImg`, `mobileBgImg`, `bgColor`, `bgOpacity`, `height`, `bgVideoType` (`local`, `vimeo`, `gjw`, `youtube`) + `bgVideoId` + `bgVideoPoster`, `bannerImg`, `imgPosition`, `imgRounded`, `bannerMarginTopMobile`, `titleColor`, `titleBgColor`, `titleBgOpacity`, `descriptionColor`, `title2`, `description2`, `bottomInfo`, `isTextAlignCenter`, `map`, buttons (`btn1Text` / `btn1Href`, `btn2Text` / `btn2Href`, `addOrderOnlineBtn`, `addTableReservationBtn`) |
| `video` | `Video.astro` | `videoType` (`vimeo`, `gjw`, `youtube`), `videoId` (list), `isOnlyDisplayOnMobile`, `bgImg`, `bgColor`, `bgOpacity` |
| `gallery` | `Gallery.astro` | `folderPath`, `mode` (1 to 4), `showImgName`, `imgNameColor`, `menuItemImgRounded`, `initialVisibleMobile`, `initialVisibleDesktop`, `bgColor` |
| `textBlock` | `TextBlock.astro` | `titleColor`, `descriptionColor`, `bgImg`, `bgColor`, `bgOpacity` |
| `map` | `Map.astro` | `iframeUrl`, `url` (directions link), `getDirectionBtnInsteadText`, `addTelBtn`, `tel`, `tel2`, `telInsteadText`, `tel2InsteadText` |
| `modal` | `Modal.astro` | Promo pop-up: `titleSize`, `titleColor`, `descriptionSize`, `descriptionColor`, `imgName`, `imgAlt`, `imgHref`, `buttonText`, `btnHref` |
| `reviews` | `Reviews.astro` | `items` (`body`, `author.name`, `author.handle`, `rating.rating`, `rating.maxStars`), `buttonText`, `href`, `bgColor` |
| `googleReviewsSlider` | `GoogleReviewsSlider.astro` | `items` (`body`, `author.name`, `author.imageUrl`, `rating`), `bgColor` |
| `codeInsert` | `CodeInsert.astro` | `code`: list of `{ type: externalScript / inlineScript / html, content }` |
| `privacy`, `terms`, `cookie`, `accessibility` | `Privacy`, `Terms`, `Cookie`, `Accessibility` | Legal pages, generated from the site-wide fields |

### Alt text fields

Background images (`bgImg`, `mobileBgImg`, `bgVideoPoster`, footer `bgImg`) are decorative and always render with an empty `alt` and `aria-hidden="true"`.

| Section | Field | Default | Meaning |
|---|---|---|---|
| `hero`, `feature` (`imgWithText`) | `bannerImgAlt` | empty (decorative) | Alt text of `bannerImg` |
| `modal` | `imgAlt` | empty (decorative) | Alt text of `imgName` |
| `gallery` | `altOverrides` | none | Map of file name to alt text, for example `{ "012_Pork_Bao.jpg": "Steamed pork buns in a bamboo basket" }`. The key may be the file name with or without extension. An empty string marks the picture as decorative. Used for all modes, the thumbnail button label and the enlarged view |

Without an override, a gallery alt text is made from the file name: leading digits, underscores, hyphens and spaces are removed, `__` becomes `、`, `_` becomes a space and `w:` becomes `w/`. If nothing but digits is left, the alt text is empty.

## Working on the theme

- Keep content fields backwards compatible: sites are upgraded one by one, and a missing field must fall back to a sensible default.
- Do not change `package.json` dependencies in a way that needs the sites' lock files regenerated. Removing a dependency is fine, adding one is not.
- Class names that are built at runtime (`mt-${n}`, `rounded-${x}`) are invisible to Tailwind. That is why `global.css` keeps those rules.
- When you add a field, add it to this file.

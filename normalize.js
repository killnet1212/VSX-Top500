/* ============================================================
   normalize.js — единая нормализация данных Marketplace API.
   Используется в app.js (браузер) и update-top500.js (Node.js).
   ============================================================ */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.VSXNormalize = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function normalize(raw, index) {
    var stat = function (name) {
      var s = raw.statistics || [];
      for (var i = 0; i < s.length; i++) {
        if (s[i].statisticName === name) return s[i].value;
      }
      return null;
    };
    var v = (raw.versions && raw.versions[0]) || {};
    var prop = function (key) {
      var props = v.properties || [];
      for (var i = 0; i < props.length; i++) {
        if (props[i].key === key) return props[i].value || "";
      }
      return "";
    };
    var file = function (type) {
      var files = v.files || [];
      for (var i = 0; i < files.length; i++) {
        if (files[i].assetType === type) return files[i].source || "";
      }
      return "";
    };
    var id = raw.publisher.publisherName + "." + raw.extensionName;

    return {
      id: id,
      rank: index + 1,
      name: raw.displayName || raw.extensionName,
      publisher: raw.publisher.displayName || raw.publisher.publisherName,
      publisherId: raw.publisher.publisherName,
      verified: /verified/.test(raw.publisher.flags || "") || raw.publisher.isDomainVerified,
      domain: raw.publisher.domain || "",
      short: raw.shortDescription || "",
      installs: stat("install"),
      downloads: stat("downloadCount"),
      rating: stat("averagerating"),
      weightedRating: stat("weightedRating"),
      ratingCount: stat("ratingcount"),
      trendingWeekly: stat("trendingweekly"),
      trendingMonthly: stat("trendingmonthly"),
      lastUpdated: raw.lastUpdated,
      published: raw.publishedDate,
      categories: raw.categories || [],
      tags: (raw.tags || []).filter(function (t) { return !t.startsWith("__"); }),
      version: v.version || "",
      versionDate: v.lastUpdated || "",
      icon: file("Microsoft.VisualStudio.Services.Icons.Default") || file("Microsoft.VisualStudio.Services.Icons.Small"),
      readmeUrl: file("Microsoft.VisualStudio.Services.Content.Details"),
      changelogUrl: file("Microsoft.VisualStudio.Services.Content.Changelog"),
      licenseUrl: file("Microsoft.VisualStudio.Services.Content.License"),
      vsixUrl: file("Microsoft.VisualStudio.Services.VSIXPackage"),
      repo: prop("Microsoft.VisualStudio.Services.Links.Source") || prop("Microsoft.VisualStudio.Services.Links.GitHub"),
      support: prop("Microsoft.VisualStudio.Services.Links.Support"),
      learn: prop("Microsoft.VisualStudio.Services.Links.Learn"),
      sponsor: prop("Microsoft.VisualStudio.Code.SponsorLink"),
      engine: prop("Microsoft.VisualStudio.Code.Engine"),
      kind: prop("Microsoft.VisualStudio.Code.ExtensionKind"),
      pricing: prop("Microsoft.VisualStudio.Services.Content.Pricing") || "Free",
      preRelease: prop("Microsoft.VisualStudio.Code.PreRelease") === "true",
      pack: prop("Microsoft.VisualStudio.Code.ExtensionPack").split(",").filter(Boolean),
      deps: prop("Microsoft.VisualStudio.Code.ExtensionDependencies").split(",").filter(Boolean),
      languages: prop("Microsoft.VisualStudio.Code.LocalizedLanguages").split(",").filter(Boolean),
      brandColor: prop("Microsoft.VisualStudio.Services.Branding.Color"),
      marketplaceUrl: "https://marketplace.visualstudio.com/items?itemName=" + id,
    };
  }

  return { normalize: normalize };
});

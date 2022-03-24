export function render(this: any, data: any) {
  return this.bundledScript(data.scripts[data.pagination.items[0]], data);
}

export const data = {
  pagination: { data: "scripts", size: 1, addAllPagesToCollections: true },
  permalink: (data: any) => "scripts/" + data.pagination.items[0],
  scripts: {
    "Hyperbolamethod.js": "@lib/component/Hyperbolamethod",
    "FareyFractions.js": "@lib/component/FareyFractions",
    "SubgroupsWC.js": "@lib/component/SubgroupsWC",
  },
};

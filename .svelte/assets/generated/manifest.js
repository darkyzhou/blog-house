import * as layout from "/_app/assets/components/layout.svelte";

const components = [
	() => import("/_app/routes/index.svelte"),
	() => import("/_app/routes/articles/index.svelte"),
	() => import("/_app/routes/articles/[article].svelte"),
	() => import("/_app/routes/search/index.svelte"),
	() => import("/_app/routes/stub/index.svelte"),
	() => import("/_app/routes/tags/index.svelte"),
	() => import("/_app/routes/tags/[tag].svelte"),
	() => import("/_app/routes/[page].svelte")
];

export const pages = (d => [
	{
		// index.svelte
		pattern: /^\/$/,
		parts: [
			[components[0]]
		]
	},

	{
		// articles/index.svelte
		pattern: /^\/articles\/?$/,
		parts: [
			[components[1]]
		]
	},

	{
		// articles/[article].svelte
		pattern: /^\/articles\/([^/]+?)\/?$/,
		parts: [
			[components[2], m => ({ article: d(m[1]) })]
		]
	},

	{
		// search/index.svelte
		pattern: /^\/search\/?$/,
		parts: [
			[components[3]]
		]
	},

	{
		// stub/index.svelte
		pattern: /^\/stub\/?$/,
		parts: [
			[components[4]]
		]
	},

	{
		// tags/index.svelte
		pattern: /^\/tags\/?$/,
		parts: [
			[components[5]]
		]
	},

	{
		// tags/[tag].svelte
		pattern: /^\/tags\/([^/]+?)\/?$/,
		parts: [
			[components[6], m => ({ tag: d(m[1]) })]
		]
	},

	{
		// [page].svelte
		pattern: /^\/([^/]+?)\/?$/,
		parts: [
			[components[7], m => ({ page: d(m[1]) })]
		]
	}
])(decodeURIComponent);

export const ignore = [
	/^\/lunr-indexes\.json$/,
	/^\/manifest\.json$/,
	/^\/sitemap\.xml$/,
	/^\/robots\.txt$/,
	/^\/data\/articles\.json$/,
	/^\/data\/tags\.json$/,
	/^\/data\/articles\/([^/]+?)\.json$/
];

export { layout };
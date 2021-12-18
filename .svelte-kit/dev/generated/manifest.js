const c = [
	() => import("../../../src/routes/__layout.svelte"),
	() => import("../../../src/routes/__error.svelte"),
	() => import("../../../src/routes/index.svelte"),
	() => import("../../../src/routes/articles/index.svelte"),
	() => import("../../../src/routes/articles/[article].svelte"),
	() => import("../../../src/routes/stub/index.svelte"),
	() => import("../../../src/routes/tags/index.svelte"),
	() => import("../../../src/routes/tags/[tag].svelte"),
	() => import("../../../src/routes/[page].svelte")
];

const d = decodeURIComponent;

export const routes = [
	// src/routes/index.svelte
	[/^\/$/, [c[0], c[2]], [c[1]]],

	,

	,

	,

	// src/routes/articles/index.svelte
	[/^\/articles\/?$/, [c[0], c[3]], [c[1]]],

	// src/routes/articles/[article].svelte
	[/^\/articles\/([^/]+?)\/?$/, [c[0], c[4]], [c[1]], (m) => ({ article: d(m[1])})],

	,

	,

	,

	// src/routes/stub/index.svelte
	[/^\/stub\/?$/, [c[0], c[5]], [c[1]]],

	// src/routes/tags/index.svelte
	[/^\/tags\/?$/, [c[0], c[6]], [c[1]]],

	// src/routes/tags/[tag].svelte
	[/^\/tags\/([^/]+?)\/?$/, [c[0], c[7]], [c[1]], (m) => ({ tag: d(m[1])})],

	// src/routes/[page].svelte
	[/^\/([^/]+?)\/?$/, [c[0], c[8]], [c[1]], (m) => ({ page: d(m[1])})]
];

// we import the root layout/error components eagerly, so that
// connectivity errors after initialisation don't nuke the app
export const fallback = [c[0](), c[1]()];
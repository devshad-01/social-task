import React from "react";

// ThemePalette is a development-only component for visualizing the color palette.
// It should NOT be imported or used in production app code.
// To view the palette, use the dedicated ThemePalettePage and palette.jsx entry point.

const palette = [
	{
		name: "Primary",
		shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
		prefix: "primary",
	},
	{
		name: "Secondary",
		shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
		prefix: "secondary",
	},
	{
		name: "Neutral",
		shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
		prefix: "neutral",
	},
	{
		name: "Accent",
		shades: ["purple", "pink", "green", "orange"],
		prefix: "accent",
	},
	{
		name: "Status",
		shades: ["success", "warning", "error", "info"],
		prefix: "status",
	},
];

export default function ThemePalette() {
	return (
		<div className="space-y-8 p-8 bg-neutral-50 min-h-screen">
			<h1 className="text-3xl font-bold mb-8 text-primary-700">
				Theme Palette
			</h1>
			{palette.map((group) => (
				<div key={group.name}>
					<h2 className="text-xl font-semibold mb-4 text-neutral-700">
						{group.name}
					</h2>
					<div className="flex flex-wrap gap-4">
						{group.shades.map((shade) => (
							<div key={shade} className="flex flex-col items-center">
								<div
									className="w-20 h-20 rounded-lg border shadow-base mb-2"
									style={{
										background: `linear-gradient(135deg, var(--${group.prefix}-${shade}), var(--${group.prefix}-${shade}))`,
										borderColor: `var(--neutral-200)`,
									}}
								/>
								<span className="text-xs text-neutral-600">
									{group.prefix}-{shade}
								</span>
								<span className="text-[10px] text-neutral-400">
									var(--{group.prefix}-{shade})
								</span>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

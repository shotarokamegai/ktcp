const plugin = require("tailwindcss/plugin"); // ←これ必須

/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    container: false,   // ← 生成停止
    // preflight: false, // ←（任意）リセットも消す
  },
    content: [
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {},
  		screens: {
			sm: [{ max: '749px' }],
		},
 },

	plugins: [
		plugin(function ({ matchUtilities }) {
			const SP_BASE = 393;
			const TB_BASE = 1100;

			const sp = (v) => `calc(${v} / ${SP_BASE} * 100vw)`;
			const tb = (v) => `calc(${v} / ${TB_BASE} * 100vw)`;

			const allProps = {
				// ===== margin =====
				'sp-m': (v) => ({ margin: sp(v) }),
				'sp-mt': (v) => ({ marginTop: sp(v) }),
				'sp-mr': (v) => ({ marginRight: sp(v) }),
				'sp-mb': (v) => ({ marginBottom: sp(v) }),
				'sp-ml': (v) => ({ marginLeft: sp(v) }),
				'sp-mx': (v) => ({ marginLeft: sp(v), marginRight: sp(v) }),
				'sp-my': (v) => ({ marginTop: sp(v), marginBottom: sp(v) }),

				// ===== padding =====
				'sp-p': (v) => ({ padding: sp(v) }),
				'sp-pt': (v) => ({ paddingTop: sp(v) }),
				'sp-pr': (v) => ({ paddingRight: sp(v) }),
				'sp-pb': (v) => ({ paddingBottom: sp(v) }),
				'sp-pl': (v) => ({ paddingLeft: sp(v) }),
				'sp-px': (v) => ({ paddingLeft: sp(v), paddingRight: sp(v) }),
				'sp-py': (v) => ({ paddingTop: sp(v), paddingBottom: sp(v) }),

				// ===== size =====
				'sp-w': (v) => ({ width: sp(v) }),
				'sp-h': (v) => ({ height: sp(v) }),
				'sp-min-w': (v) => ({ minWidth: sp(v) }),
				'sp-min-h': (v) => ({ minHeight: sp(v) }),
				'sp-max-w': (v) => ({ maxWidth: sp(v) }),
				'sp-max-h': (v) => ({ maxHeight: sp(v) }),

				// ===== typography =====
				'sp-fs': (v) => ({ fontSize: sp(v) }),
				'sp-leading': (v) => ({ lineHeight: sp(v) }),
				'sp-tracking': (v) => ({ letterSpacing: sp(v) }),

				// ===== gap =====
				'sp-gap': (v) => ({ gap: sp(v) }),
				'sp-gap-x': (v) => ({ columnGap: sp(v) }),
				'sp-gap-y': (v) => ({ rowGap: sp(v) }),

				// ===== borders =====
				'sp-rounded': (v) => ({ borderRadius: sp(v) }),
				'sp-rounded-t': (v) => ({ borderTopLeftRadius: sp(v), borderTopRightRadius: sp(v) }),
				'sp-rounded-b': (v) => ({ borderBottomLeftRadius: sp(v), borderBottomRightRadius: sp(v) }),
				'sp-rounded-l': (v) => ({ borderTopLeftRadius: sp(v), borderBottomLeftRadius: sp(v) }),
				'sp-rounded-r': (v) => ({ borderTopRightRadius: sp(v), borderBottomRightRadius: sp(v) }),
				'sp-rounded-tl': (v) => ({ borderTopLeftRadius: sp(v) }),
				'sp-rounded-tr': (v) => ({ borderTopRightRadius: sp(v) }),
				'sp-rounded-bl': (v) => ({ borderBottomLeftRadius: sp(v) }),
				'sp-rounded-br': (v) => ({ borderBottomRightRadius: sp(v) }),

				// ===== position (top/right/bottom/left) =====
				'sp-top': (v) => ({ top: sp(v) }),
				'sp-right': (v) => ({ right: sp(v) }),
				'sp-bottom': (v) => ({ bottom: sp(v) }),
				'sp-left': (v) => ({ left: sp(v) }),

				// ===== TB（1100px 基準） =====
				'tb-m': (v) => ({ margin: tb(v) }),
				'tb-mt': (v) => ({ marginTop: tb(v) }),
				'tb-mr': (v) => ({ marginRight: tb(v) }),
				'tb-mb': (v) => ({ marginBottom: tb(v) }),
				'tb-ml': (v) => ({ marginLeft: tb(v) }),
				'tb-mx': (v) => ({ marginLeft: tb(v), marginRight: tb(v) }),
				'tb-my': (v) => ({ marginTop: tb(v), marginBottom: tb(v) }),

				'tb-p': (v) => ({ padding: tb(v) }),
				'tb-pt': (v) => ({ paddingTop: tb(v) }),
				'tb-pr': (v) => ({ paddingRight: tb(v) }),
				'tb-pb': (v) => ({ paddingBottom: tb(v) }),
				'tb-pl': (v) => ({ paddingLeft: tb(v) }),
				'tb-px': (v) => ({ paddingLeft: tb(v), paddingRight: tb(v) }),
				'tb-py': (v) => ({ paddingTop: tb(v), paddingBottom: tb(v) }),

				'tb-w': (v) => ({ width: tb(v) }),
				'tb-h': (v) => ({ height: tb(v) }),
				'tb-min-w': (v) => ({ minWidth: tb(v) }),
				'tb-min-h': (v) => ({ minHeight: tb(v) }),
				'tb-max-w': (v) => ({ maxWidth: tb(v) }),
				'tb-max-h': (v) => ({ maxHeight: tb(v) }),

				'tb-gap': (v) => ({ gap: tb(v) }),
				'tb-gap-x': (v) => ({ columnGap: tb(v) }),
				'tb-gap-y': (v) => ({ rowGap: tb(v) }),

				'tb-fs': (v) => ({ fontSize: tb(v) }),
				'tb-leading': (v) => ({ lineHeight: tb(v) }),
				'tb-tracking': (v) => ({ letterSpacing: tb(v) }),

				'tb-rounded': (v) => ({ borderRadius: tb(v) }),
				'tb-rounded-t': (v) => ({ borderTopLeftRadius: tb(v), borderTopRightRadius: tb(v) }),
				'tb-rounded-b': (v) => ({ borderBottomLeftRadius: tb(v), borderBottomRightRadius: tb(v) }),
				'tb-rounded-l': (v) => ({ borderTopLeftRadius: tb(v), borderBottomLeftRadius: tb(v) }),
				'tb-rounded-r': (v) => ({ borderTopRightRadius: tb(v), borderBottomRightRadius: tb(v) }),
				'tb-rounded-tl': (v) => ({ borderTopLeftRadius: tb(v) }),
				'tb-rounded-tr': (v) => ({ borderTopRightRadius: tb(v) }),
				'tb-rounded-bl': (v) => ({ borderBottomLeftRadius: tb(v) }),
				'tb-rounded-br': (v) => ({ borderBottomRightRadius: tb(v) }),

				// ===== TB position =====
				'tb-top': (v) => ({ top: tb(v) }),
				'tb-right': (v) => ({ right: tb(v) }),
				'tb-bottom': (v) => ({ bottom: tb(v) }),
				'tb-left': (v) => ({ left: tb(v) }),
			};
      matchUtilities(allProps, {
        values: {},
        type: "any",
      });
		}),
	],
};
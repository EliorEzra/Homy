// Spacing scale — 1rem = 16px.
// Named keys keep backward-compat with existing components;
// numeric keys match the design-system spec.
export const spacing = {
  // ── Named (used by existing components) ──────────────────────────────────
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  // ── Numeric (design-system spec) ─────────────────────────────────────────
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
};

// Border-radius scale (px)
export const radius = {
  xs:   2,
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  full: 9999,
};

// Shadow presets (React Native style objects)
export const shadows = {
  e1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  e2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  e3: {
    shadowColor: '#333333',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
};

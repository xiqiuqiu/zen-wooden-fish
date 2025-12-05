

// Replace this URL with the actual path to the user's uploaded image if hosted, 
// or a placeholder if running locally without assets.
// Since I cannot access the user's local file system, I am using a placeholder that looks like a wooden fish.
export const WOODEN_FISH_IMG_URL = "https://pic1.imgdb.cn/item/6930db8dd5fdcd03ca9d2991.png"; 
export const STRIKER_IMG_URL = "https://pic1.imgdb.cn/item/6930e65e4c455cbabc992a3e.png";

// A realistic wood block sound hosted on a reliable CDN (JSDelivr) to avoid CORS issues.
export const WOODEN_FISH_AUDIO_URL = "https://woodmp3.oss-cn-beijing.aliyuncs.com/fe9dd5334125416eae335435c54ccdfe.mp3";

export const CONVERSION_RATES = {
  MERIT_TO_BEAD: 100,
  BEAD_TO_INCENSE: 18,
  INCENSE_TO_LOTUS: 3,
};

export const SOUND_CONFIG = {
  frequency: 300,
  type: 'triangle' as OscillatorType,
  decay: 0.15,
};

export const TRANSLATIONS = {
  zh: {
    title: "电子木鱼",
    total_accumulation: "累计功德",
    seek_wisdom: "求签解惑",
    meditating: "冥想中...",
    footer_hint: "点击积累功德 · 宁静致远",
    floating_merit: "功德 +1",
    items: {
      lotus: "莲花",
      incense: "禅香",
      beads: "佛珠",
      merits: "功德"
    },
    inventory_labels: {
      lotus: "Lotus", // Keys for logic mapping, values for display handled in component
      incense: "Incense",
      beads: "Beads",
      merits: "Merits"
    }
  },
  en: {
    title: "Zen Wooden Fish",
    total_accumulation: "Total Accumulation",
    seek_wisdom: "Seek Wisdom",
    meditating: "Meditating...",
    footer_hint: "Tap to cultivate merit · Silence the mind",
    floating_merit: "Merit +1",
    items: {
      lotus: "Lotus",
      incense: "Incense",
      beads: "Beads",
      merits: "Merits"
    },
    inventory_labels: {
      lotus: "Lotus",
      incense: "Incense",
      beads: "Beads",
      merits: "Merits"
    }
  }
};
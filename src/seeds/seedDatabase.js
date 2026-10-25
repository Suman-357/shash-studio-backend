const mongoose = require("mongoose");
const env = require("../config/env");

const Admin = require("../models/Admin");
const Section = require("../models/Section");
const Workshop = require("../models/Workshop");
const Batch = require("../models/Batch");
const Product = require("../models/Product");
const Registration = require("../models/Registration");
const ProductOrder = require("../models/ProductOrder");
const Inquiry = require("../models/Inquiry");

// ─────────────────────────────────────────────────────────────
//  1. SEED DATA DEFINITIONS (Master / Catalog Data Only)
// ─────────────────────────────────────────────────────────────

const SEED_ADMIN = {
  name: "Sushmitha (Sushii)",
  email: "admin@shashstudios.com",
  password: "admin123",
  role: "superadmin",
  isActive: true,
};

const SEED_SECTIONS = [
  {
    slug: "yoga",
    name: "Yoga & Strength",
    nameKn: "ಯೋಗ ಮತ್ತು ಶಕ್ತಿ",
    icon: "spa",
    emoji: "🪷",
    tagline: "Authentic Mysuru Vinyasa, Hatha Yoga, Strength Training & Daily Sadhana",
    taglineKn: "ಸಾಂಪ್ರದಾಯಿಕ ಮೈಸೂರು ಶೈಲಿಯ ಹಠ ಯೋಗ, ವಿನ್ಯಾಸ ಮತ್ತು ಶಕ್ತಿ ತರಬೇತಿ",
    badge: "Mysuru Lineage",
    badgeKn: "ಮೈಸೂರು ಪರಂಪರೆ",
    accentColor: "#1C3325",
    lightBg: "bg-[#F4F8F5]",
    order: 1,
  },
  {
    slug: "music",
    name: "Music & Sound Therapy",
    nameKn: "ಸಂಗೀತ ಮತ್ತು ನಾದ ಚಿಕಿತ್ಸೆ",
    icon: "graphic_eq",
    emoji: "🎵",
    tagline: "Carnatic classical, Devara Nama, acoustic flute resonance, and Sushii Nights",
    taglineKn: "ಕರ್ನಾಟಕ ಶಾಸ್ತ್ರೀಯ ಸಂಗೀತ, ದೇವರನಾಮ, ಬಿದಿರಿನ ಕೊಳಲು ಮತ್ತು ನಿದ್ರಾ ಧ್ಯಾನ",
    badge: "Sound Sanctuary",
    badgeKn: "ನಾದ ಚಿಕಿತ್ಸೆ",
    accentColor: "#C26D38",
    lightBg: "bg-[#FBF6EE]",
    order: 2,
  },
  {
    slug: "other",
    name: "Other Activities & Retreats",
    nameKn: "ಇತರ ಚಟುವಟಿಕೆಗಳು & ಶಿಬಿರಗಳು",
    icon: "hiking",
    emoji: "🌿",
    tagline: "Postpartum Maathru Samskaara, Fit & Flow, Chamundi walks, and retreats",
    taglineKn: "ಮಾತೃ ಸಂಸ್ಕಾರ, ಫಿಟ್ & ಫ್ಲೋ, ಚಾಮುಂಡಿ ಬೆಟ್ಟದ ನಡಿಗೆ ಮತ್ತು ವಿಶೇಷ ತರಬೇತಿ",
    badge: "Holistic Lifestyle",
    badgeKn: "ಸಮಗ್ರ ಜೀವನಶೈಲಿ",
    accentColor: "#2D4A37",
    lightBg: "bg-[#F0F5F2]",
    order: 3,
  },
];

const SEED_WORKSHOPS = [
  {
    slug: "hatha-yoga",
    title: "Hatha Yoga",
    titleKn: "ಹಠ ಯೋಗ",
    section: "yoga",
    sectionLabel: "Yoga & Strength",
    sectionLabelKn: "ಯೋಗ ಮತ್ತು ಶಕ್ತಿ",
    category: "vinyasa",
    categoryLabel: "Build Strength & Peace",
    description: "Build strength, balance and inner peace with authentic Mysore Hatha Yoga sadhana. Focuses on classical asana alignment, breath control, core stability, and cultivating daily vitality.",
    descriptionKn: "ಶಕ್ತಿ, ಸಮತೋಲನ ಮತ್ತು ಆಂತರಿಕ ಶಾಂತಿಯನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳಿ. ಸಾಂಪ್ರದಾಯಿಕ ಮೈಸೂರು ಹಠ ಯೋಗ ಆಸನಗಳು, ಪ್ರಾಣಾಯಾಮ, ಸಮತೋಲನ ಮತ್ತು ದೈನಂದಿನ ಆರೋಗ್ಯ ಸಾಧನೆ.",
    price: 699,
    originalPrice: 1299,
    duration: "60 Mins · 5 Days a Week",
    timingSlot: "5:30 – 6:30 AM IST (Mon – Fri)",
    timingIcon: "alarm",
    badge: "BATCH 1 · HATHA YOGA",
    batchSchedule: "Mon – Fri · 5 Days a Week",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeW6X-Xbnzzibn5vBblDaMOKZ9I5pN1IM06R4zDRuOdkD-9Wo6S3m7m_J0dK0qdWJGyueyVkmQmwzk5BxGQIVpWVDXZhXVm80sJovk1mFz71N5ZhVHUenH4R4_9Bk3eTDTvbBT952IM8xLqwXcNFPzE8Fzq9jksT6GmEJpllQ1Vja4PrcRzI8jJaqJDwQsP41wdO6-Hd03gbX80NkyitBR2PCUNesuc1Hu0ObZ1sat3JWb4IooqiCC",
    features: [
      "5 Days a week live interactive morning practice",
      "Mon – Fri 5:30 – 6:30 AM IST",
      "Build strength, balance & inner peace",
      "Classical Mysore alignment & breathwork"
    ],
    spotsLeft: 8,
    order: 1,
    isActive: true,
  },
  {
    slug: "kids-yoga",
    title: "Kids Yoga",
    titleKn: "ಮಕ್ಕಳ ಯೋಗ",
    section: "other",
    sectionLabel: "Other Activities",
    sectionLabelKn: "ಇತರ ಚಟುವಟಿಕೆಗಳು",
    category: "kids",
    categoryLabel: "Healthy Minds, Happy Hearts",
    description: "Healthy minds, happy hearts. Playful movement storytelling, posture challenges, and breathing games to build focus, memory, and an energetic morning routine before school.",
    descriptionKn: "ಆರೋಗ್ಯಕರ ಮನಸ್ಸು, ಸಂತೋಷದ ಹೃದಯ. ಮಕ್ಕಳಲ್ಲಿ ಏಕಾಗ್ರತೆ, ನೆನಪಿನ ಶಕ್ತಿ ಮತ್ತು ಶಾಲೆಯ ಮುನ್ನ ಆರೋಗ್ಯಕರ ಮುಂಜಾನೆ ದಿನಚರಿಯನ್ನು ರೂಪಿಸಲು ಕಥೆಗಳ ಮೂಲಕ ಕಲಿಸುವ ಯೋಗ.",
    price: 239,
    originalPrice: 499,
    duration: "60 Mins · 5 Days a Week",
    timingSlot: "5:30 – 6:30 AM IST (Mon – Fri)",
    timingIcon: "child_care",
    badge: "BATCH 2 · KIDS YOGA",
    batchSchedule: "Mon – Fri · 5 Days a Week",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWx2WuINFmClRF4E05mMQnZ18XYMu2qyyyVug6WRymBZxnnLaCi-Q-PQyA5YioQydeiOQC4EUJc72ZBDanMUddS_23DBNt846OpI8NwtJFOaLS1QhUnSj_nRj-ySad5LvxScOmD1RBvr4mHaQPdnMEtXHQFMh7RwAmk4GbB1kYK_A3QTnI_dam6pMiapE_z0ikK8UlPb2pfC6SE4dBufHXlsAoAThTQ3YSbuOA_AF9dj17DRhSEQe7",
    features: [
      "5 Days a week morning routine before school",
      "Mon – Fri 5:30 – 6:30 AM IST",
      "Focus, memory & cognitive agility",
      "Playful animal postures & breath games"
    ],
    spotsLeft: 6,
    order: 2,
    isActive: true,
  },
  {
    slug: "ashtanga-strength",
    title: "Ashtanga Yoga + Strength Training",
    titleKn: "ಅಷ್ಟಾಂಗ ಯೋಗ ಮತ್ತು ಶಕ್ತಿ ತರಬೇತಿ",
    section: "yoga",
    sectionLabel: "Yoga & Strength",
    sectionLabelKn: "ಯೋಗ ಮತ್ತು ಶಕ್ತಿ",
    category: "strength",
    categoryLabel: "Flexibility & Endurance",
    description: "Build flexibility, strength and endurance. Dynamic Mysore Vinyasa flow coupled with core calisthenics, functional bodyweight conditioning, and mobility drills.",
    descriptionKn: "ನಮ್ಯತೆ, ಶಕ್ತಿ ಮತ್ತು ಸಹಿಷ್ಣುತೆಯನ್ನು ನಿರ್ಮಿಸಿ. ಡೈನಾಮಿಕ್ ಮೈಸೂರು ವಿನ್ಯಾಸ, ಕೋರ್ ವ್ಯಾಯಾಮ ಮತ್ತು ಶಾರೀರಿಕ ಶಕ್ತಿ ತರಬೇತಿ.",
    price: 699,
    originalPrice: 1499,
    duration: "60 Mins · 3 Days a Week",
    timingSlot: "6:30 – 7:30 AM IST (Mon, Wed, Fri)",
    timingIcon: "fitness_center",
    badge: "BATCH 3 · ASHTANGA & STRENGTH",
    batchSchedule: "Mon, Wed, Fri · 3 Days a Week",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBaovdrEA20fBsc8MNpN-IdZDWOFWmudRa9ddQIjXQ7wMhhLMS1Yefql3G2_DFQylnazjCgFhrkLPNdVSp0D2lHEYomxs-_83swuj_ICLr05ERYZOqB8l2MR8Za_wEkptlPYSM5P168n3dzLA-QG-1HhCqmfP6xb_J6Mr3ogsTUGGUsTqHnclCjc5fu93WQCNAwEi2wwORK4JwObRB92bMPAXi04hpKBgywcVc3iQ4K_t497e2NdEfh",
    features: [
      "3 Days a week (Mon, Wed, Fri)",
      "6:30 – 7:30 AM IST live on Zoom",
      "Dynamic Vinyasa flow + core planks",
      "Build stamina, flexibility & endurance"
    ],
    spotsLeft: 5,
    order: 3,
    isActive: true,
  },
  {
    slug: "ladies-batch",
    title: "Ladies Batch (Yoga + Weight Loss)",
    titleKn: "ಮಹಿಳೆಯರ ವಿಶೇಷ ಯೋಗ ಮತ್ತು ತೂಕ ಇಳಿಸುವ ತರಬೇತಿ",
    section: "yoga",
    sectionLabel: "Yoga & Strength",
    sectionLabelKn: "ಯೋಗ ಮತ್ತು ಶಕ್ತಿ",
    category: "women",
    categoryLabel: "Yoga + Weight Loss",
    description: "Get stronger, leaner and more confident. Yoga + Weight Loss program exclusively for women, focusing on active fat burn, core strengthening, hormonal balance, thyroid health, and pelvic floor toning.",
    descriptionKn: "ಹೆಚ್ಚು ಬಲಿಷ್ಠ, ಸ್ಲಿಮ್ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸದಿಂದಿರಿ. ಮಹಿಳೆಯರಿಗೆ ವಿಶೇಷ ಯೋಗ + ತೂಕ ಇಳಿಸುವ ಕಾರ್ಯಕ್ರಮ. ಹಾರ್ಮೋನ್ ಸಮತೋಲನ, ಥೈರಾಯ್ಡ್ ಆರೋಗ್ಯ ಮತ್ತು ಶಕ್ತಿ ವೃದ್ಧಿ.",
    price: 499,
    originalPrice: 999,
    duration: "60 Mins · 3 Days a Week",
    timingSlot: "11:30 AM – 12:30 PM IST (Mon, Wed, Fri)",
    timingIcon: "sunny",
    badge: "BATCH 4 · LADIES BATCH",
    batchSchedule: "Mon, Wed, Fri · 3 Days a Week",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEOt2PxOnG_oLgwz0XPk14P5RknxKLUrYQllO9WXA6YojXJ28wzsk5wquzc5VLuSvph2mnDFLBkoPVcK6H91NdTx09v-jHqTwbp2827W3CRCiqGpBvJC4oxhoauU9cUb4Ge4q8j-wr6JodXzCP3mvmguwxhQMewz7VqUqblbg1oh2VSNUik8Nt4qCforORq3FRV33a47BhPN--31GttinC2ZsczJoHuaqxSCWmv0ThpBlUoU6KLCvU",
    features: [
      "3 Days a week (Mon, Wed, Fri)",
      "11:30 AM – 12:30 PM IST midday shala",
      "Targeted fat-burn & metabolism boost",
      "Supportive women-only community"
    ],
    spotsLeft: 5,
    order: 4,
    isActive: true,
  },
  {
    slug: "ashtanga-strength-intensive",
    title: "Ashtanga + Strength Training (Intensive)",
    titleKn: "ಅಷ್ಟಾಂಗ + ಶಕ್ತಿ ತರಬೇತಿ (ತೀವ್ರ ಅಭ್ಯಾಸ)",
    section: "yoga",
    sectionLabel: "Yoga & Strength",
    sectionLabelKn: "ಯೋಗ ಮತ್ತು ಶಕ್ತಿ",
    category: "strength",
    categoryLabel: "Mobility & Strength Pro",
    description: "Build strength, mobility and endurance. High-intensity guided Mysore cohort with dedicated posture alignment correction, advanced arm balances, bandhas, and strength mastery.",
    descriptionKn: "ಶಕ್ತಿ, ಚಲನಶೀಲತೆ ಮತ್ತು ಸಹಿಷ್ಣುತೆಯನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳಿ. ತೀವ್ರ ಮೈಸೂರು ಅಷ್ಟಾಂಗ ತರಬೇತಿ, ಆರ್ಮ್ ಬ್ಯಾಲೆನ್ಸ್ ಮತ್ತು ಆಳವಾದ ಶಕ್ತಿ ವ್ಯಾಯಾಮ.",
    price: 2000,
    originalPrice: 3500,
    duration: "60 Mins · 3 Days a Week",
    timingSlot: "6:30 – 7:30 AM IST (Mon, Wed, Fri)",
    timingIcon: "spa",
    badge: "BATCH 5 · ADVANCED INTENSIVE",
    batchSchedule: "Mon, Wed, Fri · 3 Days a Week",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwnGj6pKZVyj-nq1nUw4LlIBES-tMfCjP7DKKyaqFYd72ASHCZGIy5zhDwwKdBx1QpV_9-cd4RD3xSBEgEU8zTZhkGboliDpvUZZBdmS2QvMJU3wyDdLBKH-81-sVLg56VbNuaYfGBaoKcbhPy5X1nDmwfPE2K69BaDyz1PZ_oE-0jlA8G1EqDdz5m82UOqe8lrKbnxZ7SEoWi-xBgiHLigTWHtcdhQxL_KmcpOdaOerCMfY8j4JZ_",
    features: [
      "3 Days a week (Mon, Wed, Fri)",
      "6:30 – 7:30 AM IST cohort",
      "Advanced inversions, bandhas & calisthenics",
      "In-depth form correction & guidance"
    ],
    spotsLeft: 4,
    order: 5,
    isActive: true,
  },
  {
    slug: "carnatic-music",
    title: "Carnatic Music",
    titleKn: "ಕರ್ನಾಟಕ ಶಾಸ್ತ್ರೀಯ ಸಂಗೀತ",
    section: "music",
    sectionLabel: "Music & Sound",
    sectionLabelKn: "ಸಂಗೀತ ಮತ್ತು ನಾದ",
    category: "sound",
    categoryLabel: "Classical Vocal & Swara",
    description: "Group classes & personal classes available. Learn authentic Mysore Carnatic vocal music from foundational Sarale Varisegalu to soulful Krithis with voice culturing and shruti alignment.",
    descriptionKn: "ಗುಂಪು ತರಗತಿಗಳು ಮತ್ತು ವೈಯಕ್ತಿಕ ತರಗತಿಗಳು ಲಭ್ಯವಿದೆ. ಶಾಸ್ತ್ರೀಯ ಸಂಗೀತದ ಮೂಲಾಭ್ಯಾಸಗಳಿಂದ ಹಿಡಿದು ಸುಮಧುರ ಕೀರ್ತನೆಗಳವರೆಗೆ ರಾಗ ಮತ್ತು ಶ್ರುತಿಬದ್ಧ ಗಾಯನ ತರಬೇತಿ.",
    price: 0,
    originalPrice: 0,
    duration: "Group & Personal Classes",
    timingSlot: "Flexible Slots Available",
    timingIcon: "graphic_eq",
    badge: "BATCH 6 · CARNATIC MUSIC",
    batchSchedule: "Group & Personal Batches",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbaKT0sNCQtBXCG914Q1xqI0ZEX1A9U4K4nvafTXroWHLO5wFb7XjYz5UZyvyIDiZsmupXuCISTZqp3TrS3a4jPXwGVETNqkjQFWu8qcvGJONOCoqwAuA5yKatfyEeo_yf-A5DlsYwCHl1Ctry7uXEuI__lku9QLSkPuhAVHN3MrmAKU1nm7v_UJspEUd24msZ9TyGIA-XReVaVeQJy7J7CIP6PZFhI1frD8pUdecxjhbAg0grQ3T3",
    features: [
      "Group classes & personal 1-on-1 mentorship",
      "Enquire for fees via WhatsApp (7676405895)",
      "Voice culturing, shruti & swara alignment",
      "Beginners to advanced classical curriculum"
    ],
    spotsLeft: 5,
    order: 6,
    isActive: true,
  },
  {
    slug: "light-music",
    title: "Light Music (Devara Nama & Bhajans)",
    titleKn: "ಸುಗಮ ಸಂಗೀತ — ದಾಸರ ಪದಗಳು & ಭಜನೆಗಳು",
    section: "music",
    sectionLabel: "Music & Sound",
    sectionLabelKn: "ಸಂಗೀತ ಮತ್ತು ನಾದ",
    category: "chanting",
    categoryLabel: "Devara Nama & Bhajans",
    description: "Devara Nama & Bhajans. Immerse in devotion with soulful Purandara Dasa, Kanaka Dasa padas, Bhavageethe, and melodious bhajan singing every Saturday.",
    descriptionKn: "ದಾಸರ ಪದಗಳು ಮತ್ತು ಭಜನೆಗಳು. ಪುರಂದರದಾಸರು, ಕನಕದಾಸರ ಪದಗಳು ಮತ್ತು ಸುಮಧುರ ಭಜನೆಗಳನ್ನು ಹಾಡುವ ಆನಂದಮಯ ಶನಿವಾರದ ತರಗತಿ.",
    price: 419,
    originalPrice: 799,
    duration: "60 Mins · 1 Day a Week",
    timingSlot: "5:00 – 6:00 PM IST (Every Saturday)",
    timingIcon: "queue_music",
    badge: "BATCH 7 · LIGHT MUSIC",
    batchSchedule: "Every Saturday · 1 Day a Week",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbaKT0sNCQtBXCG914Q1xqI0ZEX1A9U4K4nvafTXroWHLO5wFb7XjYz5UZyvyIDiZsmupXuCISTZqp3TrS3a4jPXwGVETNqkjQFWu8qcvGJONOCoqwAuA5yKatfyEeo_yf-A5DlsYwCHl1Ctry7uXEuI__lku9QLSkPuhAVHN3MrmAKU1nm7v_UJspEUd24msZ9TyGIA-XReVaVeQJy7J7CIP6PZFhI1frD8pUdecxjhbAg0grQ3T3",
    features: [
      "1 Day a week (Every Saturday)",
      "5:00 – 6:00 PM IST live session",
      "Soulful Dasa Keertanas & traditional Bhajans",
      "Tanpura accompaniment & song notes provided"
    ],
    spotsLeft: 8,
    order: 7,
    isActive: true,
  },
  {
    slug: "postpartum-wellness",
    title: "Postpartum Wellness (Maathru Samskaara)",
    titleKn: "ಮಾತೃ ಸಂಸ್ಕಾರ — ಪ್ರಸವಾನಂತರದ ಸಮಗ್ರ ಆರೈಕೆ",
    section: "other",
    sectionLabel: "Other Activities",
    sectionLabelKn: "ಇತರ ಚಟುವಟಿಕೆಗಳು",
    category: "other",
    categoryLabel: "Maathru Samskaara Course",
    description: "Maathru Samskaara Course: Rest, Rebuild, Reconnect. Comprehensive postpartum recovery program for new mothers covering gentle pelvic floor restoration, core healing, and holistic nourishment.",
    descriptionKn: "ಮಾತೃ ಸಂಸ್ಕಾರ ಕೋರ್ಸ್: ವಿಶ್ರಾಂತಿ, ಮರುನಿರ್ಮಾಣ, ಮರುಸಂಪರ್ಕ. ಪ್ರಸವಾನಂತರ ತಾಯಂದಿರ ಶಾರೀರಿಕ ಮತ್ತು ಮಾನಸಿಕ ಚೇತರಿಕೆಗೆ ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶನ.",
    price: 3500,
    originalPrice: 5999,
    duration: "Complete Course Package",
    timingSlot: "Guided Cohort Program",
    timingIcon: "spa",
    badge: "BATCH 8 · COURSE PROGRAM",
    batchSchedule: "Course Program Package",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEOt2PxOnG_oLgwz0XPk14P5RknxKLUrYQllO9WXA6YojXJ28wzsk5wquzc5VLuSvph2mnDFLBkoPVcK6H91NdTx09v-jHqTwbp2827W3CRCiqGpBvJC4oxhoauU9cUb4Ge4q8j-wr6JodXzCP3mvmguwxhQMewz7VqUqblbg1oh2VSNUik8Nt4qCforORq3FRV33a47BhPN--31GttinC2ZsczJoHuaqxSCWmv0ThpBlUoU6KLCvU",
    features: [
      "Complete Course Program Package (₹3,500)",
      "Rest, rebuild and reconnect safely",
      "Diastasis recti healing & pelvic rehabilitation",
      "Ayurvedic mother-care nutrition & wellness"
    ],
    spotsLeft: 6,
    order: 8,
    isActive: true,
  },
  {
    slug: "combo-pass",
    title: "All-Access Combo Pass",
    titleKn: "ಸಂಪೂರ್ಣ ಆರೋಗ್ಯ ಕಾಂಬೋ ಪಾಸ್",
    section: "yoga",
    sectionLabel: "Yoga",
    sectionLabelKn: "ಯೋಗ",
    category: "combo",
    categoryLabel: "All Access",
    description: "Ultimate daily wellness system. Get Zoom links to all our live batches. Join active morning yoga & strength, and wind down with music sessions. Best value for dedicated seekers.",
    descriptionKn: "ಸಂಪೂರ್ಣ ದೈನಂದಿನ ಆರೋಗ್ಯ ವ್ಯವಸ್ಥೆ. ನಮ್ಮ ಎಲ್ಲಾ ಲೈವ್ ತರಗತಿಗಳ ಜೂಮ್ ಲಿಂಕ್‌ಗಳನ್ನು ಪಡೆಯಿರಿ.",
    price: 999,
    originalPrice: 1999,
    duration: "All Daily Batches",
    timingSlot: "All Daily Batches Access",
    timingIcon: "all_inclusive",
    badge: "ALL-ACCESS PASS",
    batchSchedule: "All Daily Batches",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeW6X-Xbnzzibn5vBblDaMOKZ9I5pN1IM06R4zDRuOdkD-9Wo6S3m7m_J0dK0qdWJGyueyVkmQmwzk5BxGQIVpWVDXZhXVm80sJovk1mFz71N5ZhVHUenH4R4_9Bk3eTDTvbBT952IM8xLqwXcNFPzE8Fzq9jksT6GmEJpllQ1Vja4PrcRzI8jJaqJDwQsP41wdO6-Hd03gbX80NkyitBR2PCUNesuc1Hu0ObZ1sat3JWb4IooqiCC",
    features: [
      "Zoom access to all active shala batches",
      "24-Hour Zoom Class Recordings",
      "Private WhatsApp community support",
      "Save over 50% compared to individual batches"
    ],
    spotsLeft: 12,
    order: 9,
    isActive: true,
  },
];

const SEED_PRODUCTS = [
  {
    slug: "cotton-mat",
    title: "Mysuru Heritage Handloom Cotton & Jute Yoga Mat",
    titleKn: "ಮೈಸೂರು ಸಾಂಪ್ರದಾಯಿಕ ಹತ್ತಿ ಮತ್ತು ಸೆಣಬಿನ ಯೋಗ ಚಾಪೆ",
    subtitle: "Eco-friendly handwoven mat with natural anti-slip ribbed weave",
    subtitleKn: "ನೈಸರ್ಗಿಕ ಸಾವಯವ ಹತ್ತಿ ಹಾಗೂ ಸೆಣಬಿನ ಕೈಮಗ್ಗದ ಪರಿಸರಸ್ನೇಹಿ ಚಾಪೆ",
    category: "mats",
    badge: "Bestseller Studio Mat",
    badgeKn: "ಹೆಚ್ಚು ಮಾರಾಟವಾದ ಚಾಪೆ",
    badgeColor: "bg-[#1C3325]",
    image: "/src/assets/mysuru_organic_cotton_mat.jpg",
    price: 1499,
    originalPrice: 2299,
    inStock: true,
    rating: 4.9,
    reviewCount: 142,
    leadTime: "Dispatched within 24 hours · Free Shipping",
    leadTimeKn: "೨೪ ಗಂಟೆಗಳಲ್ಲಿ ರವಾನೆ · ಉಚಿತ ಡೆಲಿವರಿ",
    features: [
      "100% GOTS certified organic handloom cotton & Mysore jute",
      "Breathable sweat-absorbing texture perfect for hot & humid Mysore mornings",
      "Natural rubberized grip backing preventing unwanted bunching or skidding",
      "Free high-tensile cotton studio travel carry-sling included",
    ],
  },
  {
    slug: "progrip-mat",
    title: "SHASH Pro-Grip Asana Alignment Eco-Rubber Mat",
    titleKn: "ಶಶ್ ಪ್ರೋ-ಗ್ರಿಪ್ ಆಸನ ಜೋಡಣೆ ಪರಿಸರ ರಬ್ಬರ್ ಚಾಪೆ",
    subtitle: "Laser-etched anatomical Mysore alignment grid with instant dry grip",
    subtitleKn: "ಲೇಸರ್ ಮುದ್ರಿತ ಆಸನ ಮಾರ್ಗದರ್ಶಿ ಮತ್ತು ಅತ್ಯುತ್ತಮ ಜಾರದ ಹಿಡಿತ",
    category: "mats",
    badge: "Master Ashtanga Series",
    badgeKn: "ಅಷ್ಟಾಂಗ ವಿಶೇಷ",
    badgeColor: "bg-[#0E6848]",
    image: "/src/assets/progrip_rubber_yoga_mat.jpg",
    price: 2199,
    originalPrice: 3199,
    inStock: true,
    rating: 4.95,
    reviewCount: 98,
    leadTime: "Dispatched within 24 hours · Free Shipping",
    leadTimeKn: "೨೪ ಗಂಟೆಗಳಲ್ಲಿ ರವಾನೆ · ಉಚಿತ ಡೆಲಿವರಿ",
    features: [
      "Engineered natural tree-rubber base with polyurethane top layer",
      "Laser-etched Mysore Tristhana alignment lines for precision hand & foot placement",
      "Zero-slip dry & wet traction even during vigorous Surya Namaskara flows",
      "5mm ultra-dense joint protection cushion for sensitive knees and spine",
    ],
  },
  {
    slug: "cork-props-kit",
    title: "Mysuru Natural Cork Yoga Blocks & Alignment Strap Duo",
    titleKn: "ಮೈಸೂರು ನೈಸರ್ಗಿಕ ಕಾರ್ಕ್ ಬ್ಲಾಕ್‌ಗಳು ಮತ್ತು ಸ್ಟ್ರ್ಯಾಪ್ ಸೆಟ್",
    subtitle: "High-density antimicrobial cork duo with 8-foot organic cotton strap",
    subtitleKn: "ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಕಾರ್ಕ್ ಬ್ಲಾಕ್‌ಗಳು ಮತ್ತು ಹತ್ತಿ ಬೆಲ್ಟ್",
    category: "props",
    badge: "Essential Alignment Kit",
    badgeKn: "ಅಗತ್ಯ ಪರಿಕರಗಳ ಕಿಟ್",
    badgeColor: "bg-[#C26D38]",
    image: "/src/assets/cork_yoga_blocks_strap_set.jpg",
    price: 899,
    originalPrice: 1499,
    inStock: true,
    rating: 4.88,
    reviewCount: 76,
    leadTime: "Dispatched within 24 hours · Free Shipping",
    leadTimeKn: "೨೪ ಗಂಟೆಗಳಲ್ಲಿ ರವಾನೆ · ಉಚಿತ ಡೆಲಿವರಿ",
    features: [
      "Two high-density bevelled oak cork blocks for restorative grounding support",
      "Solid, non-spongy stability providing confidence in balancing postures",
      "8-foot heavy-duty unbleached cotton strap with reinforced metal D-rings",
      "Naturally moisture-resistant, antimicrobial and easily wiped clean",
    ],
  },
];

// ─────────────────────────────────────────────────────────────
//  2. SEED FUNCTION
// ─────────────────────────────────────────────────────────────

async function seedDatabase(options = { cleanTransactional: true }) {
  console.log("🌱 Starting SHASH Studios Master Database Seeding...");

  // Connect to MongoDB
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(env.MONGODB_URI);
    console.log("Connected to MongoDB:", env.MONGODB_URI.replace(/:[^:]*@/, ":****@"));
  }

  // 1. Clear Transactional Data (Always clean so you start fresh!)
  if (options.cleanTransactional) {
    console.log("🧹 Clearing transactional tables (Registrations, Orders, Inquiries)...");
    await Registration.deleteMany({});
    await ProductOrder.deleteMany({});
    await Inquiry.deleteMany({});
    console.log("✅ Transactional data cleared: 0 registrations, 0 orders, 0 inquiries.");
  }

  // 2. Seed Admin
  console.log("👤 Seeding Administrator...");
  await Admin.deleteMany({});
  const admin = await Admin.create(SEED_ADMIN);
  console.log(`✅ Superadmin created: ${admin.email} (Password: admin123)`);

  // 3. Seed Sections
  console.log("📂 Seeding Curriculum Sections...");
  await Section.deleteMany({});
  const createdSections = await Section.insertMany(SEED_SECTIONS);
  console.log(`✅ Seeded ${createdSections.length} sections.`);

  // 4. Seed Workshops
  console.log("🧘 Seeding Workshops...");
  await Workshop.deleteMany({});
  const createdWorkshops = await Workshop.insertMany(SEED_WORKSHOPS);
  console.log(`✅ Seeded ${createdWorkshops.length} workshops.`);

  // Workshop mapping for Batches
  const workshopMap = {};
  createdWorkshops.forEach((w) => {
    workshopMap[w.slug] = w;
  });

  // 5. Seed Real Batches (Linked to Workshops)
  console.log("📅 Seeding Batches for all Workshops...");
  await Batch.deleteMany({});

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const BATCH_DEFINITIONS = [
    {
      workshopSlug: "hatha-yoga",
      batchCode: "SHASH-BATCH-1-HATHA",
      title: "Batch 1 · Hatha Yoga (5:30 AM Mon-Fri)",
      titleKn: "ಬ್ಯಾಚ್ ೧: ಹಠ ಯೋಗ (ಮುಂಜಾನೆ ೫:೩೦)",
      section: "yoga",
      slotTime: "5:30 AM – 6:30 AM IST (Mon – Fri)",
      capacity: 25,
      instructorName: "Sushii",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-1",
    },
    {
      workshopSlug: "kids-yoga",
      batchCode: "SHASH-BATCH-2-KIDS",
      title: "Batch 2 · Kids Yoga (5:30 AM Mon-Fri)",
      titleKn: "ಬ್ಯಾಚ್ ೨: ಮಕ್ಕಳ ಯೋಗ (ಮುಂಜಾನೆ ೫:೩೦)",
      section: "other",
      slotTime: "5:30 AM – 6:30 AM IST (Mon – Fri)",
      capacity: 20,
      instructorName: "Sushii",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-2",
    },
    {
      workshopSlug: "ashtanga-strength",
      batchCode: "SHASH-BATCH-3-ASHTANGA-STR",
      title: "Batch 3 · Ashtanga Yoga + Strength Training (6:30 AM Mon, Wed, Fri)",
      titleKn: "ಬ್ಯಾಚ್ ೩: ಅಷ್ಟಾಂಗ ಯೋಗ ಮತ್ತು ಶಕ್ತಿ ತರಬೇತಿ",
      section: "yoga",
      slotTime: "6:30 AM – 7:30 AM IST (Mon, Wed, Fri)",
      capacity: 25,
      instructorName: "Sushii",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-3",
    },
    {
      workshopSlug: "ladies-batch",
      batchCode: "SHASH-BATCH-4-LADIES",
      title: "Batch 4 · Ladies Batch: Yoga + Weight Loss (11:30 AM Mon, Wed, Fri)",
      titleKn: "ಬ್ಯಾಚ್ ೪: ಮಹಿಳೆಯರ ಯೋಗ ಮತ್ತು ತೂಕ ಇಳಿಸುವ ತರಬೇತಿ",
      section: "yoga",
      slotTime: "11:30 AM – 12:30 PM IST (Mon, Wed, Fri)",
      capacity: 25,
      instructorName: "Sushii",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-4",
    },
    {
      workshopSlug: "ashtanga-strength-intensive",
      batchCode: "SHASH-BATCH-5-ASHTANGA-PRO",
      title: "Batch 5 · Ashtanga + Strength Training Intensive (6:30 AM Mon, Wed, Fri)",
      titleKn: "ಬ್ಯಾಚ್ ೫: ಅಷ್ಟಾಂಗ + ಶಕ್ತಿ ತರಬೇತಿ (ತೀವ್ರ ಅಭ್ಯಾಸ)",
      section: "yoga",
      slotTime: "6:30 AM – 7:30 AM IST (Mon, Wed, Fri)",
      capacity: 15,
      instructorName: "Sushii",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-5",
    },
    {
      workshopSlug: "carnatic-music",
      batchCode: "SHASH-BATCH-6-CARNATIC",
      title: "Batch 6 · Carnatic Music (Group & Personal)",
      titleKn: "ಬ್ಯಾಚ್ ೬: ಕರ್ನಾಟಕ ಶಾಸ್ತ್ರೀಯ ಸಂಗೀತ",
      section: "music",
      slotTime: "Flexible Slots (Group & Personal)",
      capacity: 20,
      instructorName: "Sushii & Vidwan Team",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-6",
    },
    {
      workshopSlug: "light-music",
      batchCode: "SHASH-BATCH-7-LIGHT-MUSIC",
      title: "Batch 7 · Light Music: Devara Nama & Bhajans (5:00 PM Saturday)",
      titleKn: "ಬ್ಯಾಚ್ ೭: ಸುಗಮ ಸಂಗೀತ — ದಾಸರ ಪದಗಳು ಮತ್ತು ಭಜನೆಗಳು",
      section: "music",
      slotTime: "5:00 PM – 6:00 PM IST (Every Saturday)",
      capacity: 35,
      instructorName: "Sushii & Team",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-7",
    },
    {
      workshopSlug: "postpartum-wellness",
      batchCode: "SHASH-BATCH-8-POSTPARTUM",
      title: "Batch 8 · Postpartum Wellness: Maathru Samskaara Course Program",
      titleKn: "ಬ್ಯಾಚ್ ೮: ಮಾತೃ ಸಂಸ್ಕಾರ — ಪ್ರಸವಾನಂತರದ ಸಮಗ್ರ ಆರೈಕೆ",
      section: "other",
      slotTime: "Guided Cohort Program Package",
      capacity: 20,
      instructorName: "Sushii & Postpartum Specialists",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-8",
    },
    {
      workshopSlug: "combo-pass",
      batchCode: "SHASH-BATCH-ALL-ACCESS",
      title: "All-Access Mysore Sanctuary Pass (All Live Batches)",
      titleKn: "ಸಂಪೂರ್ಣ ಪ್ರವೇಶ ಮೈಸೂರು ಕಾಂಬೋ ಪಾಸ್",
      section: "yoga",
      slotTime: "All Daily Batches Access",
      capacity: 100,
      instructorName: "Sushii",
      zoomLink: "https://zoom.us/j/shash-live-mysuru-all",
    },
  ];

  const batchesToInsert = BATCH_DEFINITIONS.map((b) => {
    const parentWorkshop = workshopMap[b.workshopSlug];
    return {
      workshopId: parentWorkshop ? parentWorkshop._id : new mongoose.Types.ObjectId(),
      batchCode: b.batchCode,
      title: b.title,
      titleKn: b.titleKn,
      section: b.section,
      slotTime: b.slotTime,
      startDate: nextMonth,
      endDate: nextMonthEnd,
      capacity: b.capacity,
      enrolledCount: 0,
      zoomLink: b.zoomLink,
      instructorName: b.instructorName,
      status: "upcoming",
    };
  });

  const createdBatches = await Batch.insertMany(batchesToInsert);
  console.log(`✅ Seeded ${createdBatches.length} active batches linked to workshops.`);

  // 6. Seed Products
  console.log("🛍️ Seeding Studio Store Products...");
  await Product.deleteMany({});
  const createdProducts = await Product.insertMany(SEED_PRODUCTS);
  console.log(`✅ Seeded ${createdProducts.length} store products.`);

  console.log("\n=========================================================");
  console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
  console.log("Master / Catalog Data:");
  console.log(`  - Admins      : 1 (admin@shashstudios.com / admin123)`);
  console.log(`  - Sections    : ${createdSections.length}`);
  console.log(`  - Workshops   : ${createdWorkshops.length}`);
  console.log(`  - Batches     : ${createdBatches.length}`);
  console.log(`  - Products    : ${createdProducts.length}`);
  console.log("Transactional Data (Fresh & Empty):");
  console.log(`  - Bookings/Registrations : 0`);
  console.log(`  - Product Orders         : 0`);
  console.log(`  - Inquiries              : 0`);
  console.log("=========================================================\n");
}

// Auto-run if executed directly via CLI: node seedDatabase.js
if (require.main === module) {
  seedDatabase()
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seeding Error:", err);
      mongoose.disconnect();
      process.exit(1);
    });
}

module.exports = seedDatabase;

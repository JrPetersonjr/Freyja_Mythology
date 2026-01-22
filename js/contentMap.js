window.FREYJA_CONTENT_MAP = [

  // --- Invocation & Frontispiece (pages 1–2) -------------------------
  {
    id: "invocation",
    title: "Invocation of Freyja",
    tabLabel: "Invocation",
    startPage: 1,
    endPage: 2,
    pages: {
      1: {
        type: "text",
        headingRubric: "Opening",
        headingMain: "Invocation of the Lady",
        sigil: "sigil-freyja",
        dropcap: "H",
        body: [
          "Here is written not a tale alone, but an asking.",
          "He who opens this codex calls upon Freyja, Lady of Many Realms, to walk between the pages.",
          "Let ink remember what the tongue forgets, and let gold leaf hold what the heart cannot say aloud.",
          "If you read with care, you will find not only her stories, but the shadows of your own."
        ],
        marginalia: {
          scribe: "Every codex is a doorway. This one opens inward.",
          ink: "crimson-blood",
          placement: "outer"
        },
        runic: {
          futhark: "ᚠᚱᛖᛃᚨ",
          meaning: "Freyja",
          style: "blood-inked"
        }
      },

      2: {
        type: "image",
        headingRubric: "Frontispiece",
        headingMain: "Freyja, Threshold of Realms",
        sigil: "sigil-freyja",
        dropcap: "F",
        src: "assets/images/intro_freyja.png",
        caption: "Freyja at the liminal edge, where fields, halls, and battle-plains meet.",
        marginalia: {
          scribe: "She stands where no single realm is enough.",
          ink: "storm-blue",
          placement: "outer"
        },
        runic: {
          futhark: "ᛚᚨᛞᛁ ᛟᚠ ᚱᛖᚨᛚᛗᛋ",
          meaning: "Lady of Realms",
          style: "sky-inked"
        }
      }
    }
  },

  // --- Lady of Many Realms (page 3) ---------------------------------
  {
    id: "lady_of_many_realms",
    title: "Lady of Many Realms",
    tabLabel: "Realms",
    startPage: 3,
    endPage: 3,
    pages: {
      3: {
        type: "image",
        headingRubric: "Presence",
        headingMain: "The Lady of Many Realms",
        sigil: "sigil-freyja",
        dropcap: "L",
        src: "assets/images/lady_of_many_realms.png",
        caption: "Freyja as seen differently in field, hall, and battlefield — one face, many reflections.",
        marginalia: {
          scribe: "She is never only what one tale says she is.",
          ink: "crimson-blood",
          placement: "outer"
        },
        runic: {
          futhark: "ᛗᚨᚾᛃ ᚱᛖᚨᛚᛗᛋ",
          meaning: "Many Realms",
          style: "blood-inked"
        }
      }
    }
  },

  // --- Chariot and Boar (page 4) ------------------------------------
  {
    id: "chariot_and_boar",
    title: "Chariot and Boar",
    tabLabel: "Chariot",
    startPage: 4,
    endPage: 4,
    pages: {
      4: {
        type: "image",
        headingRubric: "Movement",
        headingMain: "Chariot and Boar",
        sigil: "sigil-chariot",
        dropcap: "C",
        src: "assets/images/Chariot_and_boar.png",
        caption: "Freyja’s chariot and the golden-bristled boar that bears her into battle and feast alike.",
        marginalia: {
          scribe: "Her paths are not straight roads, but circuits between desire and doom.",
          ink: "storm-blue",
          placement: "outer"
        },
        runic: {
          futhark: "ᚷᚹᛟᛏᛁ ᛒᛟᚨᚱ",
          meaning: "Blessed Boar",
          style: "sky-inked"
        }
      }
    }
  },

  // --- Brísingamen (pages 5–6) --------------------------------------
  {
    id: "brisingamen",
    title: "Brísingamen: The Gilded Price",
    tabLabel: "Brísingamen",
    startPage: 5,
    endPage: 6,
    pages: {
      5: {
        type: "text",
        headingRubric: "The Ordeal",
        headingMain: "The Gilded Price",
        sigil: "sigil-brisingamen",
        dropcap: "B",
        body: [
          "Before the necklace shone at her throat, it lay in the deep.",
          "Freyja descended to them not as a queen, but as a seeker.",
          "The dwarves named their price, and she accepted it with blood.",
          "When she emerged again into the upper world, the necklace was hers."
        ],
        marginalia: {
          scribe: "The dwarves asked a price no coin could match.",
          ink: "crimson-blood",
          placement: "outer"
        },
        runic: {
          futhark: "ᚾᛗᚱ᱉ ᛗᚩᚾᛞ",
          meaning: "Deep price",
          style: "blood-inked"
        }
      },

      6: {
        type: "image",
        headingRubric: "Artifact",
        headingMain: "Brísingamen Forged",
        sigil: "sigil-brisingamen",
        dropcap: "B",
        src: "assets/images/brisingamen_ordeal.png",
        caption: "The forging of Brísingamen by the four dwarven brothers.",
        marginalia: {
          scribe: "Some treasures are bought with more than gold.",
          ink: "crimson-blood",
          placement: "outer"
        },
        runic: {
          futhark: "ᛒᚱᛁᛋᛁᚾᚷᚨᛗᛖᚾ",
          meaning: "Brísingamen",
          style: "blood-inked"
        }
      }
    }
  },

  // --- Falcon Cloak (page 7) ----------------------------------------
  {
    id: "falcon_cloak",
    title: "Falcon Cloak",
    tabLabel: "Falcon",
    startPage: 7,
    endPage: 7,
    pages: {
      7: {
        type: "image",
        headingRubric: "Transformation",
        headingMain: "Falcon Cloak",
        sigil: "sigil-falcon",
        dropcap: "F",
        src: "assets/images/falcon_cloak.png",
        caption: "Freyja in full falcon form, wings spread across the Nine Realms.",
        marginalia: {
          scribe: "The cloak is not just flight — it is passage.",
          ink: "storm-blue",
          placement: "outer"
        },
        runic: {
          futhark: "ᚠᚱᛖᛃᚨ ᚠᚨᛚᚲᚩᚾ",
          meaning: "Freyja Falcon",
          style: "sky-inked"
        }
      }
    }
  },

  // --- Shadow Index (page 8) ----------------------------------------
  {
    id: "shadow_index",
    title: "Shadow Index",
    tabLabel: "Shadows",
    startPage: 8,
    endPage: 8,
    pages: {
      8: {
        type: "image",
        headingRubric: "Appendix",
        headingMain: "The Shadow Index",
        sigil: "sigil-shadow-index",
        dropcap: "S",
        src: "assets/images/shadow_index.png",
        caption: "An index of names, omens, and echoes that follow Freyja’s stories between the lines.",
        marginalia: {
          scribe: "Every tale leaves a shadow. Here they are named.",
          ink: "crimson-blood",
          placement: "outer"
        },
        runic: {
          futhark: "ᛋᚺᚨᛞᛟᚹ",
          meaning: "Shadow",
          style: "blood-inked"
        }
      }
    }
  }

];

function fallbackImage(name) {
  const safeName = svgText(name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      <rect width="900" height="1200" fill="#f1eadf"/>
      <rect x="80" y="80" width="740" height="1040" fill="#ffffff" stroke="#151617" stroke-width="6"/>
      <text x="450" y="560" text-anchor="middle" font-family="Arial" font-size="54" font-weight="700" fill="#151617">DROPCTRL</text>
      <text x="450" y="630" text-anchor="middle" font-family="Arial" font-size="32" fill="#697078">${safeName}</text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function svgText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function productImage(type, name, color, accent, view = "front") {
  const viewNames = {
    front: "Front view",
    detail: "Detail view",
    styled: "Styled view"
  };
  const label = viewNames[view] || "Product view";
  const safeName = svgText(name);
  const safeLabel = svgText(label);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="#151617" flood-opacity="0.22"/>
        </filter>
        <pattern id="stitch" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 12H12" stroke="${accent}" stroke-width="3" stroke-linecap="round" opacity="0.32"/>
        </pattern>
      </defs>
      <rect width="900" height="1200" fill="#f5efe4"/>
      <path d="M0 0H900V1200H0Z" fill="#f5efe4"/>
      <path d="M88 120H812V1080H88Z" fill="#fffdf8" stroke="#151617" stroke-width="5"/>
      <path d="M88 120H812L760 190H140Z" fill="#c8ff38" stroke="#151617" stroke-width="5"/>
      <text x="140" y="205" font-family="Arial, sans-serif" font-size="31" font-weight="700" fill="#151617">${safeLabel}</text>
      <text x="140" y="250" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="#151617">${safeName}</text>
      ${garmentSvg(type, color, accent, view)}
      <text x="450" y="1040" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#151617">DROPCTRL accurate product mockup</text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function garmentSvg(type, color, accent, view) {
  if (type.includes("tee")) return teeSvg(type, color, accent, view);
  if (type.includes("jogger")) return joggerSvg(type, color, accent, view);
  if (type.includes("jean")) return jeansSvg(type, color, accent, view);
  if (type.includes("cargo") || type.includes("trouser")) return pantsSvg(type, color, accent, view);
  return shirtSvg(type, color, accent, view);
}

function shirtSvg(type, color, accent, view) {
  const isCamp = type.includes("camp");
  const isOvershirt = type.includes("overshirt");
  const isLinen = type.includes("linen");
  const buttonColor = isOvershirt ? "#d9d2c5" : accent;
  const texture = isLinen ? '<path d="M292 470H608M280 545H620M292 620H608M310 695H590" stroke="#ffffff" stroke-width="5" opacity="0.28"/>' : "";
  const zipper = isOvershirt
    ? '<path d="M450 390V798" stroke="#d9d2c5" stroke-width="10"/><path d="M466 430V790" stroke="#151617" stroke-width="3" stroke-dasharray="10 13" opacity="0.55"/>'
    : '<path d="M450 410V794" stroke="#151617" stroke-width="4" opacity="0.55"/><circle cx="450" cy="486" r="8" fill="' + buttonColor + '"/><circle cx="450" cy="566" r="8" fill="' + buttonColor + '"/><circle cx="450" cy="646" r="8" fill="' + buttonColor + '"/><circle cx="450" cy="726" r="8" fill="' + buttonColor + '"/>';
  const collar = isCamp
    ? '<path d="M374 360L450 438L526 360L558 430L498 470L450 428L402 470L342 430Z" fill="#fffdf8" stroke="#151617" stroke-width="5"/>'
    : '<path d="M370 352L450 426L530 352L540 420L492 460L450 426L408 460L360 420Z" fill="#fffdf8" stroke="#151617" stroke-width="5"/>';

  if (view === "detail") {
    return `
      <g filter="url(#shadow)">
        <path d="M260 345H640V870H260Z" fill="${color}" stroke="#151617" stroke-width="7"/>
        ${collar}
        ${zipper}
        <path d="M505 532H612V640H505Z" fill="${color}" stroke="#151617" stroke-width="6"/>
        <path d="M515 560H602" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>
        ${texture}
        <text x="450" y="920" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#697078">${isOvershirt ? "zip pocket detail" : isCamp ? "camp collar detail" : "collar and pocket detail"}</text>
      </g>
    `;
  }

  return `
    <g filter="url(#shadow)">
      <path d="M322 368L242 438L194 654L286 686L324 560V870H576V560L614 686L706 654L658 438L578 368Z" fill="${color}" stroke="#151617" stroke-width="8" stroke-linejoin="round"/>
      ${collar}
      ${zipper}
      <path d="M520 548H598V646H520Z" fill="${color}" stroke="#151617" stroke-width="5"/>
      ${texture}
      ${view === "styled" ? '<path d="M318 842H582" stroke="' + accent + '" stroke-width="16" stroke-linecap="round"/><path d="M276 688L190 812" stroke="#151617" stroke-width="7" opacity="0.24"/>' : ""}
    </g>
  `;
}

function teeSvg(type, color, accent, view) {
  const hasGraphic = type.includes("graphic");
  const graphic = hasGraphic
    ? '<path d="M394 540H506L470 620H540L386 780L426 654H360Z" fill="' + accent + '" stroke="#151617" stroke-width="5"/>'
    : '<path d="M390 590H510" stroke="' + accent + '" stroke-width="16" stroke-linecap="round" opacity="0.8"/>';

  if (view === "detail") {
    return `
      <g filter="url(#shadow)">
        <path d="M292 378H608V854H292Z" fill="${color}" stroke="#151617" stroke-width="8"/>
        <path d="M382 378C398 440 502 440 518 378" fill="none" stroke="#151617" stroke-width="13"/>
        ${graphic}
        <path d="M312 806H588" stroke="#151617" stroke-width="6" stroke-dasharray="15 13" opacity="0.5"/>
        <text x="450" y="918" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#697078">${hasGraphic ? "front graphic print" : "heavy cotton texture"}</text>
      </g>
    `;
  }

  return `
    <g filter="url(#shadow)">
      <path d="M320 360L240 410L176 612L282 654L326 548V860H574V548L618 654L724 612L660 410L580 360C548 430 352 430 320 360Z" fill="${color}" stroke="#151617" stroke-width="8" stroke-linejoin="round"/>
      <path d="M386 374C404 430 496 430 514 374" fill="none" stroke="#151617" stroke-width="13"/>
      ${graphic}
      ${view === "styled" ? '<path d="M330 852H570" stroke="' + accent + '" stroke-width="14" stroke-linecap="round"/><path d="M248 650L198 760" stroke="#151617" stroke-width="7" opacity="0.22"/>' : ""}
    </g>
  `;
}

function pantsSvg(type, color, accent, view) {
  const isCargo = type.includes("cargo");
  const isTrouser = type.includes("trouser");
  const pleats = isTrouser ? '<path d="M420 376L398 820M480 376L502 820" stroke="#151617" stroke-width="4" opacity="0.38"/>' : "";
  const pockets = isCargo
    ? '<path d="M290 552H394V674H290Z" fill="' + color + '" stroke="#151617" stroke-width="6"/><path d="M506 552H610V674H506Z" fill="' + color + '" stroke="#151617" stroke-width="6"/><path d="M304 586H380M520 586H596" stroke="' + accent + '" stroke-width="6"/>'
    : '<path d="M324 390L388 450M576 390L512 450" stroke="#151617" stroke-width="5" opacity="0.42"/>';

  if (view === "detail") {
    return `
      <g filter="url(#shadow)">
        <path d="M260 360H640V780H260Z" fill="${color}" stroke="#151617" stroke-width="8"/>
        <path d="M260 426H640" stroke="#151617" stroke-width="7"/>
        ${pockets}
        ${pleats}
        <path d="M296 740H604" stroke="url(#stitch)" stroke-width="10"/>
        <text x="450" y="920" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#697078">${isCargo ? "cargo pocket detail" : "pleat and waistband detail"}</text>
      </g>
    `;
  }

  return `
    <g filter="url(#shadow)">
      <path d="M300 350H600L626 878H504L462 482H438L396 878H274Z" fill="${color}" stroke="#151617" stroke-width="8" stroke-linejoin="round"/>
      <path d="M300 420H600" stroke="#151617" stroke-width="7"/>
      <path d="M450 420V878" stroke="#151617" stroke-width="5" opacity="0.55"/>
      ${pockets}
      ${pleats}
      ${view === "styled" ? '<path d="M282 864H394M506 864H618" stroke="' + accent + '" stroke-width="13" stroke-linecap="round"/>' : ""}
    </g>
  `;
}

function joggerSvg(type, color, accent, view) {
  const isTech = type.includes("tech");
  const zipper = isTech ? '<path d="M318 554H408M492 554H582" stroke="#151617" stroke-width="7"/><path d="M332 574H394M506 574H568" stroke="' + accent + '" stroke-width="4"/>' : "";
  const drawcord = '<path d="M426 405C432 455 404 462 398 492M474 405C468 455 496 462 502 492" stroke="' + accent + '" stroke-width="7" fill="none" stroke-linecap="round"/>';

  if (view === "detail") {
    return `
      <g filter="url(#shadow)">
        <path d="M270 350H630V800H270Z" fill="${color}" stroke="#151617" stroke-width="8"/>
        <path d="M270 426H630" stroke="#151617" stroke-width="7"/>
        ${drawcord}
        ${zipper}
        <path d="M304 760H596" stroke="#151617" stroke-width="12" stroke-dasharray="20 14" opacity="0.46"/>
        <text x="450" y="920" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#697078">${isTech ? "zip pocket and drawcord" : "soft cuff and drawcord"}</text>
      </g>
    `;
  }

  return `
    <g filter="url(#shadow)">
      <path d="M306 350H594L620 832L586 882H498L462 504H438L402 882H314L280 832Z" fill="${color}" stroke="#151617" stroke-width="8" stroke-linejoin="round"/>
      <path d="M306 420H594" stroke="#151617" stroke-width="7"/>
      <path d="M450 420V856" stroke="#151617" stroke-width="5" opacity="0.45"/>
      ${drawcord}
      ${zipper}
      <path d="M310 838H400M500 838H590" stroke="${accent}" stroke-width="14" stroke-linecap="round"/>
      ${view === "styled" ? '<path d="M314 884H402M498 884H586" stroke="#151617" stroke-width="8" opacity="0.2"/>' : ""}
    </g>
  `;
}

function jeansSvg(type, color, accent, view) {
  const isCarpenter = type.includes("carpenter");
  const utility = isCarpenter
    ? '<path d="M604 548C674 590 666 690 604 730" fill="none" stroke="' + accent + '" stroke-width="9"/><path d="M284 590H382V698H284Z" fill="' + color + '" stroke="#151617" stroke-width="6"/>'
    : '<path d="M328 388C348 438 392 454 424 452M572 388C552 438 508 454 476 452" fill="none" stroke="#151617" stroke-width="5" opacity="0.4"/>';

  if (view === "detail") {
    return `
      <g filter="url(#shadow)">
        <path d="M260 350H640V810H260Z" fill="${color}" stroke="#151617" stroke-width="8"/>
        <path d="M260 424H640" stroke="#151617" stroke-width="7"/>
        <path d="M450 350V810" stroke="#151617" stroke-width="5" opacity="0.48"/>
        <path d="M288 458H400V590H288Z" fill="${color}" stroke="#151617" stroke-width="6"/>
        <path d="M500 458H612V590H500Z" fill="${color}" stroke="#151617" stroke-width="6"/>
        ${utility}
        <path d="M286 764H614" stroke="${accent}" stroke-width="7" stroke-dasharray="14 12"/>
        <text x="450" y="920" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#697078">${isCarpenter ? "utility loop and pocket" : "five-pocket stitch detail"}</text>
      </g>
    `;
  }

  return `
    <g filter="url(#shadow)">
      <path d="M298 340H602L632 884H502L462 486H438L398 884H268Z" fill="${color}" stroke="#151617" stroke-width="8" stroke-linejoin="round"/>
      <path d="M298 416H602" stroke="#151617" stroke-width="7"/>
      <path d="M450 416V884" stroke="#151617" stroke-width="5" opacity="0.5"/>
      <path d="M332 386C350 438 392 456 422 456M568 386C550 438 508 456 478 456" fill="none" stroke="#151617" stroke-width="5" opacity="0.42"/>
      ${utility}
      <path d="M282 840H394M506 840H618" stroke="${accent}" stroke-width="6" stroke-dasharray="12 11"/>
    </g>
  `;
}

const products = [
  {
    id: "boxy-oxford",
    name: "Boxy Oxford Shirt",
    category: "Shirts",
    price: 76,
    tag: "New fit",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Sky", hex: "#a9d8ff" },
      { name: "Bone", hex: "#eee7da" },
      { name: "Ink", hex: "#1a1e22" }
    ],
    images: [
      productImage("oxford-shirt", "Boxy Oxford Shirt", "#a9d8ff", "#1a1e22", "front"),
      productImage("oxford-shirt", "Boxy Oxford Shirt", "#eee7da", "#a9d8ff", "detail"),
      productImage("oxford-shirt", "Boxy Oxford Shirt", "#1a1e22", "#a9d8ff", "styled")
    ],
    description: "A crisp cotton shirt with dropped shoulders, a square hem, and enough structure to dress up jeans.",
    fit: "Boxy relaxed",
    fabric: "Cotton poplin",
    details: "Hidden placket, chest pocket, square hem"
  },
  {
    id: "resort-camp-shirt",
    name: "Resort Camp Shirt",
    category: "Shirts",
    price: 69,
    tag: "Airy",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Citrus", hex: "#ffd166" },
      { name: "Palm", hex: "#3dbb7f" },
      { name: "Black", hex: "#111111" }
    ],
    images: [
      productImage("camp-shirt", "Resort Camp Shirt", "#ffd166", "#3dbb7f", "front"),
      productImage("camp-shirt", "Resort Camp Shirt", "#3dbb7f", "#ffd166", "detail"),
      productImage("camp-shirt", "Resort Camp Shirt", "#111111", "#ffd166", "styled")
    ],
    description: "A loose camp-collar shirt made for warm weather, layered chains, and wide-leg trousers.",
    fit: "Relaxed drape",
    fabric: "Viscose blend",
    details: "Open collar, straight hem, soft handfeel"
  },
  {
    id: "oversized-tee",
    name: "Oversized Heavy Tee",
    category: "T-Shirts",
    price: 44,
    tag: "Heavyweight",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Washed Black", hex: "#2a2d2f" },
      { name: "Chalk", hex: "#f3f0e8" },
      { name: "Signal Red", hex: "#ff4f5f" }
    ],
    images: [
      productImage("heavy-tee", "Oversized Heavy Tee", "#2a2d2f", "#ff4f5f", "front"),
      productImage("heavy-tee", "Oversized Heavy Tee", "#f3f0e8", "#2a2d2f", "detail"),
      productImage("heavy-tee", "Oversized Heavy Tee", "#ff4f5f", "#151617", "styled")
    ],
    description: "A dense jersey tee with a big sleeve, high neck, and cropped length that sits right at the belt.",
    fit: "Oversized crop",
    fabric: "260 GSM cotton",
    details: "Rib neck, double-needle hem, garment wash"
  },
  {
    id: "graphic-tee",
    name: "Signal Graphic Tee",
    category: "T-Shirts",
    price: 52,
    tag: "Drop only",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Lime", hex: "#c8ff38" },
      { name: "Navy", hex: "#1b2746" }
    ],
    images: [
      productImage("graphic-tee", "Signal Graphic Tee", "#ffffff", "#c8ff38", "front"),
      productImage("graphic-tee", "Signal Graphic Tee", "#c8ff38", "#1b2746", "detail"),
      productImage("graphic-tee", "Signal Graphic Tee", "#1b2746", "#c8ff38", "styled")
    ],
    description: "A loud front graphic on a clean streetwear block, built for cargos, denim, and layered overshirts.",
    fit: "Relaxed",
    fabric: "Combed cotton",
    details: "Screen print, soft wash, reinforced collar"
  },
  {
    id: "utility-cargo",
    name: "Utility Cargo Pants",
    category: "Pants",
    price: 96,
    tag: "Best seller",
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      { name: "Olive", hex: "#5d6b3f" },
      { name: "Stone", hex: "#b8ad9b" },
      { name: "Black", hex: "#111111" }
    ],
    images: [
      productImage("cargo-pants", "Utility Cargo Pants", "#5d6b3f", "#c8ff38", "front"),
      productImage("cargo-pants", "Utility Cargo Pants", "#b8ad9b", "#151617", "detail"),
      productImage("cargo-pants", "Utility Cargo Pants", "#111111", "#c8ff38", "styled")
    ],
    description: "Wide utility cargos with articulated knees, deep pockets, and a cinch hem for stacking over sneakers.",
    fit: "Wide straight",
    fabric: "Cotton ripstop",
    details: "Six pockets, knee darts, adjustable hem"
  },
  {
    id: "pleated-trouser",
    name: "Pleated Easy Trouser",
    category: "Pants",
    price: 88,
    tag: "Tailored",
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      { name: "Charcoal", hex: "#43484c" },
      { name: "Taupe", hex: "#9e8f7d" },
      { name: "Slate", hex: "#52616d" }
    ],
    images: [
      productImage("pleated-trouser", "Pleated Easy Trouser", "#43484c", "#d9d2c5", "front"),
      productImage("pleated-trouser", "Pleated Easy Trouser", "#9e8f7d", "#151617", "detail"),
      productImage("pleated-trouser", "Pleated Easy Trouser", "#52616d", "#c8ff38", "styled")
    ],
    description: "Smart trousers with an elastic back waist, single pleat, and sneaker-friendly break.",
    fit: "Relaxed taper",
    fabric: "Twill blend",
    details: "Pleated front, elastic back, clean waistband"
  },
  {
    id: "tech-jogger",
    name: "Tech Zip Jogger",
    category: "Joggers",
    price: 74,
    tag: "Water ready",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Graphite", hex: "#363a3f" },
      { name: "Ice", hex: "#dbe9ef" },
      { name: "Volt", hex: "#c8ff38" }
    ],
    images: [
      productImage("tech-jogger", "Tech Zip Jogger", "#363a3f", "#c8ff38", "front"),
      productImage("tech-jogger", "Tech Zip Jogger", "#dbe9ef", "#177e89", "detail"),
      productImage("tech-jogger", "Tech Zip Jogger", "#c8ff38", "#151617", "styled")
    ],
    description: "A tapered jogger with zipped cargo pockets and a light shell finish for commute-to-late-night plans.",
    fit: "Tapered",
    fabric: "Nylon stretch",
    details: "Zip pockets, elastic cuff, drawcord waist"
  },
  {
    id: "fleece-jogger",
    name: "Cloud Fleece Jogger",
    category: "Joggers",
    price: 62,
    tag: "Soft touch",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Ash", hex: "#bfc3c5" },
      { name: "Mocha", hex: "#7c6254" },
      { name: "Spruce", hex: "#31594a" }
    ],
    images: [
      productImage("fleece-jogger", "Cloud Fleece Jogger", "#bfc3c5", "#151617", "front"),
      productImage("fleece-jogger", "Cloud Fleece Jogger", "#7c6254", "#ffd166", "detail"),
      productImage("fleece-jogger", "Cloud Fleece Jogger", "#31594a", "#c8ff38", "styled")
    ],
    description: "Brushed fleece joggers with a clean cuff and relaxed thigh, made for matching hoodies or crisp tees.",
    fit: "Relaxed taper",
    fabric: "Cotton fleece",
    details: "Brushed interior, cuffed ankle, hidden drawcord"
  },
  {
    id: "straight-jean",
    name: "90s Straight Jean",
    category: "Jeans",
    price: 84,
    tag: "Vintage wash",
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: [
      { name: "Mid Blue", hex: "#557da8" },
      { name: "Rinse", hex: "#202f44" },
      { name: "Stone", hex: "#c9c2b5" }
    ],
    images: [
      productImage("straight-jean", "90s Straight Jean", "#557da8", "#f6d07c", "front"),
      productImage("straight-jean", "90s Straight Jean", "#202f44", "#f6d07c", "detail"),
      productImage("straight-jean", "90s Straight Jean", "#c9c2b5", "#151617", "styled")
    ],
    description: "Straight-leg denim with a vintage wash, sturdy handfeel, and a rise that works with cropped tops.",
    fit: "Straight",
    fabric: "Rigid cotton denim",
    details: "Five-pocket, button fly, washed finish"
  },
  {
    id: "baggy-jean",
    name: "Baggy Carpenter Jean",
    category: "Jeans",
    price: 98,
    tag: "Wide leg",
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      { name: "Faded Black", hex: "#3d3f42" },
      { name: "Vintage Blue", hex: "#6d91b6" },
      { name: "Raw", hex: "#172234" }
    ],
    images: [
      productImage("carpenter-jeans", "Baggy Carpenter Jean", "#3d3f42", "#f6d07c", "front"),
      productImage("carpenter-jeans", "Baggy Carpenter Jean", "#6d91b6", "#f6d07c", "detail"),
      productImage("carpenter-jeans", "Baggy Carpenter Jean", "#172234", "#c8ff38", "styled")
    ],
    description: "A roomy carpenter jean with utility loops, heavy stitching, and enough volume for chunky sneakers.",
    fit: "Baggy",
    fabric: "Heavy cotton denim",
    details: "Hammer loop, utility pocket, wide leg"
  },
  {
    id: "linen-shirt",
    name: "Open Weave Linen Shirt",
    category: "Shirts",
    price: 82,
    tag: "Breathable",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Oat", hex: "#d6c7a8" },
      { name: "Sea Glass", hex: "#91c7bd" },
      { name: "Ink", hex: "#1a1e22" }
    ],
    images: [
      productImage("linen-shirt", "Open Weave Linen Shirt", "#d6c7a8", "#31594a", "front"),
      productImage("linen-shirt", "Open Weave Linen Shirt", "#91c7bd", "#151617", "detail"),
      productImage("linen-shirt", "Open Weave Linen Shirt", "#1a1e22", "#d6c7a8", "styled")
    ],
    description: "A breathable linen shirt with a relaxed collar and textured weave that reads clean without looking stiff.",
    fit: "Easy regular",
    fabric: "Linen cotton",
    details: "Natural texture, shell buttons, curved hem"
  },
  {
    id: "denim-overshirt",
    name: "Denim Zip Overshirt",
    category: "Shirts",
    price: 112,
    tag: "Layer piece",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Washed Indigo", hex: "#4c6688" },
      { name: "Black Wash", hex: "#242628" },
      { name: "Ecru", hex: "#e8dfcf" }
    ],
    images: [
      productImage("denim-overshirt", "Denim Zip Overshirt", "#4c6688", "#d9d2c5", "front"),
      productImage("denim-overshirt", "Denim Zip Overshirt", "#242628", "#c8ff38", "detail"),
      productImage("denim-overshirt", "Denim Zip Overshirt", "#e8dfcf", "#4c6688", "styled")
    ],
    description: "A zip-front denim overshirt with a cropped body, workwear pockets, and enough weight to act as a jacket.",
    fit: "Cropped boxy",
    fabric: "Cotton denim",
    details: "Metal zip, patch pockets, garment wash"
  }
];

const fitLooks = [
  {
    name: "Citrus Camp Cargo",
    button: "Camp + cargo",
    upperId: "resort-camp-shirt",
    lowerId: "utility-cargo",
    upperColor: "Citrus",
    lowerColor: "Olive",
    upperStyle: "shirt",
    lowerStyle: "cargo",
    accent: "#3dbb7f"
  },
  {
    name: "Signal Denim Stack",
    button: "Graphic + jean",
    upperId: "graphic-tee",
    lowerId: "baggy-jean",
    upperColor: "Lime",
    lowerColor: "Faded Black",
    upperStyle: "tee",
    lowerStyle: "jean",
    accent: "#c8ff38"
  },
  {
    name: "Oxford Trouser Edit",
    button: "Oxford + trouser",
    upperId: "boxy-oxford",
    lowerId: "pleated-trouser",
    upperColor: "Sky",
    lowerColor: "Charcoal",
    upperStyle: "shirt",
    lowerStyle: "trouser",
    accent: "#a9d8ff"
  },
  {
    name: "Denim Overshirt Rig",
    button: "Overshirt + denim",
    upperId: "denim-overshirt",
    lowerId: "straight-jean",
    upperColor: "Washed Indigo",
    lowerColor: "Mid Blue",
    upperStyle: "overshirt",
    lowerStyle: "jean",
    accent: "#d9d2c5"
  },
  {
    name: "Cloud Jogger Set",
    button: "Heavy tee + jogger",
    upperId: "oversized-tee",
    lowerId: "fleece-jogger",
    upperColor: "Chalk",
    lowerColor: "Ash",
    upperStyle: "tee",
    lowerStyle: "jogger",
    accent: "#ff4f5f"
  }
];

const state = {
  category: "All",
  size: "All",
  maxPrice: 140,
  search: "",
  sort: "featured",
  modalProduct: null,
  modalImage: 0,
  modalSize: "",
  modalColor: ""
};

let cart = loadCart();

const els = {
  categoryFilters: document.querySelector("#categoryFilters"),
  sizeFilters: document.querySelector("#sizeFilters"),
  selectedSizeText: document.querySelector("#selectedSizeText"),
  searchInput: document.querySelector("#searchInput"),
  priceRange: document.querySelector("#priceRange"),
  priceValue: document.querySelector("#priceValue"),
  sortSelect: document.querySelector("#sortSelect"),
  productGrid: document.querySelector("#productGrid"),
  resultCount: document.querySelector("#resultCount"),
  emptyState: document.querySelector("#emptyState"),
  clearFilters: document.querySelector("#clearFilters"),
  cartButton: document.querySelector("#cartButton"),
  cartDrawer: document.querySelector("#cartDrawer"),
  closeCart: document.querySelector("#closeCart"),
  cartItems: document.querySelector("#cartItems"),
  cartSubtotal: document.querySelector("#cartSubtotal"),
  cartCount: document.querySelector("#cartCount"),
  overlay: document.querySelector("#overlay"),
  productModal: document.querySelector("#productModal"),
  closeModal: document.querySelector("#closeModal"),
  modalImage: document.querySelector("#modalImage"),
  thumbnailRow: document.querySelector("#thumbnailRow"),
  modalCategory: document.querySelector("#modalCategory"),
  modalName: document.querySelector("#modalName"),
  modalDescription: document.querySelector("#modalDescription"),
  modalPrice: document.querySelector("#modalPrice"),
  modalSizes: document.querySelector("#modalSizes"),
  modalColors: document.querySelector("#modalColors"),
  modalDetails: document.querySelector("#modalDetails"),
  modalAddToCart: document.querySelector("#modalAddToCart"),
  themeButton: document.querySelector("#themeButton"),
  fitModelCanvas: document.querySelector("#fitModelCanvas"),
  fitModelFallback: document.querySelector("#fitModelFallback"),
  fitControls: document.querySelector("#fitControls"),
  fitLookName: document.querySelector("#fitLookName"),
  fitLookPieces: document.querySelector("#fitLookPieces")
};

function money(value) {
  return `$${value}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function imageTag(src, alt, className = "") {
  return `<img ${className ? `class="${className}"` : ""} src="${src}" alt="${escapeHtml(alt)}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImage(alt)}';">`;
}

function renderIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function fitProduct(id) {
  return products.find((product) => product.id === id);
}

function fitColor(productId, colorName) {
  const product = fitProduct(productId);
  const color = product?.colors.find((item) => item.name === colorName) || product?.colors[0];
  return color?.hex || "#151617";
}

function fitPieces(look) {
  const upper = fitProduct(look.upperId);
  const lower = fitProduct(look.lowerId);
  return [upper?.name, lower?.name].filter(Boolean).join(" / ");
}

function showFitModelFallback(message) {
  if (!els.fitModelFallback) return;
  els.fitModelFallback.textContent = message;
  els.fitModelFallback.hidden = false;
}

function initFitModel() {
  if (!els.fitModelCanvas || !els.fitControls) return;

  els.fitControls.innerHTML = fitLooks
    .map((look, index) => `
      <button class="fit-look-button" type="button" data-fit-look="${index}">
        ${escapeHtml(look.button)}
      </button>
    `)
    .join("");

  if (!window.THREE) {
    showFitModelFallback("3D preview needs Three.js to load.");
    return;
  }

  try {
    const THREE = window.THREE;
    const canvas = els.fitModelCanvas;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = new THREE.Group();
    let outfitGroup = new THREE.Group();
    let activeLook = 0;
    let nextAutoChange = performance.now() + 5200;
    let resizeFrame = 0;

    if (THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    camera.position.set(0, 1.5, 6.25);
    camera.lookAt(0, 1.35, 0);

    scene.add(root);
    root.add(outfitGroup);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x5a5149, 1.55));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.15);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38d5ff, 1.35);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    const skinMaterial = material("#caa98c", 0.8);
    const darkMaterial = material("#151617", 0.58);
    const soleMaterial = material("#f7f4ed", 0.64);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x151617, transparent: true, opacity: 0.58 });

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 24), skinMaterial);
    head.position.set(0, 2.72, 0);
    root.add(head);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.22, 24), skinMaterial);
    neck.position.set(0, 2.43, 0);
    root.add(neck);

    const cap = meshWithEdges(new THREE.BoxGeometry(0.52, 0.12, 0.48), darkMaterial, 0.25);
    cap.position.set(0, 2.95, 0);
    root.add(cap);

    const leftArm = makeArm(-1);
    const rightArm = makeArm(1);
    root.add(leftArm, rightArm);

    const leftShoe = meshWithEdges(new THREE.BoxGeometry(0.44, 0.16, 0.7), darkMaterial, 0.25);
    leftShoe.position.set(-0.28, -0.04, 0.16);
    const rightShoe = meshWithEdges(new THREE.BoxGeometry(0.44, 0.16, 0.7), darkMaterial, 0.25);
    rightShoe.position.set(0.28, -0.04, 0.16);
    const leftSole = meshWithEdges(new THREE.BoxGeometry(0.49, 0.06, 0.75), soleMaterial, 0.2);
    leftSole.position.set(-0.28, -0.15, 0.17);
    const rightSole = meshWithEdges(new THREE.BoxGeometry(0.49, 0.06, 0.75), soleMaterial, 0.2);
    rightSole.position.set(0.28, -0.15, 0.17);
    root.add(leftShoe, rightShoe, leftSole, rightSole);

    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(1.55, 1.75, 0.08, 72),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, transparent: true, opacity: 0.52 })
    );
    floor.position.set(0, -0.22, 0);
    root.add(floor);

    function material(color, roughness = 0.7) {
      return new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness: 0.02,
        side: THREE.DoubleSide
      });
    }

    function meshWithEdges(geometry, meshMaterial, opacity = 0.36) {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(geometry, meshMaterial);
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry, 24),
        new THREE.LineBasicMaterial({ color: 0x151617, transparent: true, opacity })
      );
      group.add(mesh, edges);
      return group;
    }

    function makeArm(side) {
      const group = new THREE.Group();
      group.position.set(side * 0.74, 2.05, -0.01);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.94, 18), skinMaterial);
      arm.position.set(side * 0.08, -0.47, 0);
      arm.rotation.z = side * 0.16;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.095, 18, 14), skinMaterial);
      hand.position.set(side * 0.16, -0.94, 0.01);
      group.rotation.z = side * 0.19;
      group.add(arm, hand);
      return group;
    }

    function upperGeometry(style) {
      const isTee = style === "tee";
      const isOvershirt = style === "overshirt";
      const sleeve = isTee ? 1.12 : isOvershirt ? 1.02 : 0.95;
      const hem = isOvershirt ? 0.62 : 0.54;
      const shape = new THREE.Shape();

      shape.moveTo(-0.48, 0.8);
      shape.lineTo(-sleeve, 0.42);
      shape.lineTo(-0.82, 0.08);
      shape.lineTo(-0.61, 0.2);
      shape.lineTo(-hem, -0.79);
      shape.lineTo(hem, -0.79);
      shape.lineTo(0.61, 0.2);
      shape.lineTo(0.82, 0.08);
      shape.lineTo(sleeve, 0.42);
      shape.lineTo(0.48, 0.8);
      shape.lineTo(0.24, 0.72);
      shape.quadraticCurveTo(0.1, 0.54, 0, 0.54);
      shape.quadraticCurveTo(-0.1, 0.54, -0.24, 0.72);
      shape.lineTo(-0.48, 0.8);

      const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.28, bevelEnabled: false });
      geometry.center();
      return geometry;
    }

    function boltGeometry() {
      const shape = new THREE.Shape();
      shape.moveTo(-0.12, 0.23);
      shape.lineTo(0.11, 0.23);
      shape.lineTo(0.02, 0.02);
      shape.lineTo(0.19, 0.02);
      shape.lineTo(-0.1, -0.31);
      shape.lineTo(-0.02, -0.07);
      shape.lineTo(-0.21, -0.07);
      shape.lineTo(-0.12, 0.23);
      return new THREE.ShapeGeometry(shape);
    }

    function addLine(group, points, yOffset = 0) {
      const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map((point) => new THREE.Vector3(point[0], point[1] + yOffset, point[2]))
      );
      group.add(new THREE.Line(geometry, lineMaterial));
    }

    function addButton(group, x, y, color) {
      const button = new THREE.Mesh(
        new THREE.CircleGeometry(0.036, 18),
        new THREE.MeshStandardMaterial({ color, roughness: 0.55, side: THREE.DoubleSide })
      );
      button.position.set(x, y, 0.17);
      group.add(button);
    }

    function makeUpper(look) {
      const color = fitColor(look.upperId, look.upperColor);
      const accent = look.accent;
      const upper = meshWithEdges(upperGeometry(look.upperStyle), material(color), 0.44);
      upper.position.set(0, 1.66, 0.04);

      addLine(upper, [[-0.18, 0.6, 0.17], [0, 0.45, 0.17], [0.18, 0.6, 0.17]]);

      if (look.upperStyle === "tee") {
        const bolt = new THREE.Mesh(boltGeometry(), material(accent, 0.46));
        bolt.position.set(0, -0.05, 0.18);
        upper.add(bolt);
        addLine(upper, [[-0.36, -0.58, 0.17], [0.36, -0.58, 0.17]]);
      } else {
        addLine(upper, [[0, 0.42, 0.17], [0, -0.72, 0.17]]);
        addButton(upper, 0, 0.22, accent);
        addButton(upper, 0, -0.02, accent);
        addButton(upper, 0, -0.26, accent);

        const pocket = meshWithEdges(new THREE.BoxGeometry(0.3, 0.24, 0.035), material(color), 0.32);
        pocket.position.set(0.31, -0.08, 0.18);
        upper.add(pocket);

        if (look.upperStyle === "overshirt") {
          const zip = meshWithEdges(new THREE.BoxGeometry(0.045, 1.08, 0.045), material(accent, 0.48), 0.2);
          zip.position.set(0.02, -0.1, 0.2);
          upper.add(zip);
        }
      }

      return upper;
    }

    function makeLower(look) {
      const group = new THREE.Group();
      const color = fitColor(look.lowerId, look.lowerColor);
      const accent = look.accent;
      const lowerMaterial = material(color);
      const waist = meshWithEdges(new THREE.BoxGeometry(1.05, 0.25, 0.48), lowerMaterial, 0.4);
      waist.position.set(0, 0.96, 0);
      group.add(waist);

      const legTop = look.lowerStyle === "jogger" ? 0.24 : 0.28;
      const legBottom = look.lowerStyle === "jean" ? 0.24 : look.lowerStyle === "jogger" ? 0.15 : 0.2;
      const legHeight = 1.26;

      [-1, 1].forEach((side) => {
        const leg = meshWithEdges(
          new THREE.CylinderGeometry(legTop, legBottom, legHeight, 24),
          lowerMaterial,
          0.4
        );
        leg.position.set(side * 0.28, 0.32, 0);
        group.add(leg);

        if (look.lowerStyle === "jogger") {
          const cuff = meshWithEdges(new THREE.BoxGeometry(0.38, 0.12, 0.42), material(accent, 0.52), 0.24);
          cuff.position.set(side * 0.28, -0.31, 0.02);
          group.add(cuff);
        }
      });

      addLine(group, [[0, 1.09, 0.26], [0, -0.22, 0.26]]);

      if (look.lowerStyle === "cargo") {
        [-1, 1].forEach((side) => {
          const pocket = meshWithEdges(new THREE.BoxGeometry(0.28, 0.34, 0.055), lowerMaterial, 0.32);
          pocket.position.set(side * 0.47, 0.38, 0.25);
          group.add(pocket);
          addLine(group, [[side * 0.57, 0.45, 0.29], [side * 0.37, 0.45, 0.29]]);
        });
      }

      if (look.lowerStyle === "jean") {
        addLine(group, [[-0.43, 0.98, 0.27], [-0.2, 0.74, 0.27]]);
        addLine(group, [[0.43, 0.98, 0.27], [0.2, 0.74, 0.27]]);
        addLine(group, [[-0.44, -0.18, 0.25], [-0.12, -0.18, 0.25]]);
        addLine(group, [[0.12, -0.18, 0.25], [0.44, -0.18, 0.25]]);
      }

      if (look.lowerStyle === "trouser") {
        addLine(group, [[-0.18, 0.84, 0.27], [-0.25, -0.18, 0.27]]);
        addLine(group, [[0.18, 0.84, 0.27], [0.25, -0.18, 0.27]]);
      }

      return group;
    }

    function buildOutfit(look) {
      const group = new THREE.Group();
      group.add(makeUpper(look));
      group.add(makeLower(look));
      return group;
    }

    function disposeObject(object) {
      object.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((item) => item.dispose());
        }
      });
    }

    function selectFitLook(index, manual = false) {
      const look = fitLooks[index];
      if (!look) return;

      root.remove(outfitGroup);
      disposeObject(outfitGroup);
      outfitGroup = buildOutfit(look);
      root.add(outfitGroup);
      activeLook = index;

      els.fitLookName.textContent = look.name;
      els.fitLookPieces.textContent = fitPieces(look);

      els.fitControls.querySelectorAll("[data-fit-look]").forEach((button) => {
        button.classList.toggle("active", Number(button.dataset.fitLook) === index);
      });

      if (manual) {
        nextAutoChange = performance.now() + 12000;
      }
    }

    function resize() {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        const aspect = width / height;
        renderer.setSize(width, height, false);
        camera.aspect = aspect;
        camera.fov = aspect < 0.85 ? 37 : 34;
        camera.position.z = aspect < 0.85 ? 7.65 : 6.25;
        camera.position.y = aspect < 0.85 ? 1.46 : 1.5;
        camera.updateProjectionMatrix();
      });
    }

    els.fitControls.addEventListener("click", (event) => {
      const button = event.target.closest("[data-fit-look]");
      if (!button) return;
      selectFitLook(Number(button.dataset.fitLook), true);
    });

    if (window.ResizeObserver) {
      new ResizeObserver(resize).observe(canvas);
    } else {
      window.addEventListener("resize", resize);
    }

    selectFitLook(0);
    resize();

    function animate(now) {
      const time = now * 0.001;

      if (reducedMotion) {
        root.rotation.y = 0.2;
      } else {
        root.rotation.y = time * 0.32;
        root.position.y = Math.sin(time * 2.2) * 0.035;
        leftArm.rotation.z = -0.12 + Math.sin(time * 2.1) * 0.09;
        rightArm.rotation.z = 0.12 - Math.sin(time * 2.1) * 0.09;
        outfitGroup.rotation.z = Math.sin(time * 1.8) * 0.018;

        if (now > nextAutoChange) {
          selectFitLook((activeLook + 1) % fitLooks.length);
          nextAutoChange = now + 5200;
        }
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  } catch (error) {
    console.warn(error);
    showFitModelFallback("3D preview is unavailable in this browser.");
  }
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("dropctrl-cart")) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("dropctrl-cart", JSON.stringify(cart));
}

function categories() {
  return ["All", ...new Set(products.map((product) => product.category))];
}

function sizes() {
  return ["All", ...new Set(products.flatMap((product) => product.sizes))];
}

function filteredProducts() {
  const search = state.search.trim().toLowerCase();
  let result = products.filter((product) => {
    const matchesCategory = state.category === "All" || product.category === state.category;
    const matchesSize = state.size === "All" || product.sizes.includes(state.size);
    const matchesPrice = product.price <= state.maxPrice;
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search);

    return matchesCategory && matchesSize && matchesPrice && matchesSearch;
  });

  if (state.sort === "price-low") {
    result = [...result].sort((a, b) => a.price - b.price);
  }
  if (state.sort === "price-high") {
    result = [...result].sort((a, b) => b.price - a.price);
  }
  if (state.sort === "newest") {
    result = [...result].reverse();
  }

  return result;
}

function renderFilters() {
  els.categoryFilters.innerHTML = categories()
    .map((category) => {
      const count = category === "All"
        ? products.length
        : products.filter((product) => product.category === category).length;
      return `
        <button class="chip ${state.category === category ? "active" : ""}" type="button" data-category="${category}">
          ${category}<span>${count}</span>
        </button>
      `;
    })
    .join("");

  els.sizeFilters.innerHTML = sizes()
    .map((size) => `
      <button class="size-pill ${state.size === size ? "active" : ""}" type="button" data-size="${size}">
        ${size}
      </button>
    `)
    .join("");

  els.selectedSizeText.textContent = state.size === "All" ? "Any" : state.size;
  els.priceValue.textContent = money(state.maxPrice);
}

function productCard(product) {
  const swatches = product.colors
    .map((color) => `<span class="swatch" style="background:${color.hex}" title="${escapeHtml(color.name)}"></span>`)
    .join("");
  const gallery = product.images
    .map((image, index) => imageTag(image, `${product.name} view ${index + 1}`))
    .join("");

  return `
    <article class="product-card">
      <div class="product-media">
        ${imageTag(product.images[0], product.name)}
        <div class="badge-row">
          <span class="badge">${product.tag}</span>
        </div>
        <button class="quick-view" type="button" data-action="view" data-id="${product.id}">
          <i data-lucide="eye"></i>
          View
        </button>
      </div>
      <div class="product-body">
        <span class="product-kicker">${product.category}</span>
        <div class="product-name-row">
          <h3>${product.name}</h3>
          <span class="product-price">${money(product.price)}</span>
        </div>
        <p class="product-meta">${product.fit} | ${product.fabric}</p>
        <div class="mini-gallery">${gallery}</div>
        <div class="card-footer">
          <div>
            <span class="swatch-label">${product.colors.length} colors</span>
            <div class="swatches">${swatches}</div>
          </div>
          <button class="add-card" type="button" aria-label="Add ${escapeHtml(product.name)} to cart" data-action="quick-add" data-id="${product.id}">
            <i data-lucide="plus"></i>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  const result = filteredProducts();
  els.productGrid.innerHTML = result.map(productCard).join("");
  els.resultCount.textContent = `${result.length} ${result.length === 1 ? "item" : "items"}`;
  els.emptyState.hidden = result.length > 0;
  renderIcons();
}

function resetFilters() {
  state.category = "All";
  state.size = "All";
  state.maxPrice = 140;
  state.search = "";
  state.sort = "featured";
  els.searchInput.value = "";
  els.priceRange.value = "140";
  els.sortSelect.value = "featured";
  render();
}

function addToCart(product, size = product.sizes[0], color = product.colors[0].name) {
  const key = `${product.id}-${size}-${color}`;
  const existing = cart.find((item) => item.key === key);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      key,
      id: product.id,
      size,
      color,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  openCart();
}

function cartProduct(item) {
  return products.find((product) => product.id === item.id);
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const product = cartProduct(item);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  els.cartCount.textContent = totalItems;
  els.cartSubtotal.textContent = money(subtotal);

  if (!cart.length) {
    els.cartItems.innerHTML = `
      <div class="cart-empty">
        <div>
          <i data-lucide="shopping-bag"></i>
          <p>Your bag is waiting for a first piece.</p>
        </div>
      </div>
    `;
    renderIcons();
    return;
  }

  els.cartItems.innerHTML = cart
    .map((item) => {
      const product = cartProduct(item);
      if (!product) return "";

      return `
        <article class="cart-line">
          ${imageTag(product.images[0], product.name)}
          <div>
            <h3>${product.name}</h3>
            <p>${item.size} / ${item.color}</p>
            <p>${money(product.price)} each</p>
            <div class="quantity">
              <button type="button" data-cart="decrease" data-key="${item.key}" aria-label="Decrease quantity">-</button>
              <strong>${item.quantity}</strong>
              <button type="button" data-cart="increase" data-key="${item.key}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="remove-button" type="button" data-cart="remove" data-key="${item.key}" aria-label="Remove item">
            <i data-lucide="trash-2"></i>
          </button>
        </article>
      `;
    })
    .join("");

  renderIcons();
}

function openCart() {
  closeModal();
  els.overlay.hidden = false;
  els.cartDrawer.classList.add("open");
  els.cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  els.cartDrawer.classList.remove("open");
  els.cartDrawer.setAttribute("aria-hidden", "true");
  if (!els.productModal.classList.contains("open")) {
    els.overlay.hidden = true;
  }
}

function openProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  state.modalProduct = product;
  state.modalImage = 0;
  state.modalSize = product.sizes[0];
  state.modalColor = product.colors[0].name;
  closeCart();
  renderModal();
  els.overlay.hidden = false;
  els.productModal.classList.add("open");
  els.productModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  els.productModal.classList.remove("open");
  els.productModal.setAttribute("aria-hidden", "true");
  if (!els.cartDrawer.classList.contains("open")) {
    els.overlay.hidden = true;
  }
}

function renderModal() {
  const product = state.modalProduct;
  if (!product) return;

  els.modalImage.src = product.images[state.modalImage];
  els.modalImage.alt = product.name;
  els.modalImage.onerror = () => {
    els.modalImage.onerror = null;
    els.modalImage.src = fallbackImage(product.name);
  };
  els.modalCategory.textContent = product.category;
  els.modalName.textContent = product.name;
  els.modalDescription.textContent = product.description;
  els.modalPrice.textContent = money(product.price);

  els.thumbnailRow.innerHTML = product.images
    .map((image, index) => `
      <button class="${state.modalImage === index ? "active" : ""}" type="button" data-modal-image="${index}" aria-label="Show ${escapeHtml(product.name)} image ${index + 1}">
        ${imageTag(image, `${product.name} thumbnail ${index + 1}`)}
      </button>
    `)
    .join("");

  els.modalSizes.innerHTML = product.sizes
    .map((size) => `
      <button class="modal-size ${state.modalSize === size ? "active" : ""}" type="button" data-modal-size="${size}">
        ${size}
      </button>
    `)
    .join("");

  els.modalColors.innerHTML = product.colors
    .map((color) => `
      <button class="color-choice ${state.modalColor === color.name ? "active" : ""}" type="button" data-modal-color="${color.name}">
        <span class="swatch" style="background:${color.hex}"></span>${color.name}
      </button>
    `)
    .join("");

  els.modalDetails.innerHTML = `
    <div><dt>Fit</dt><dd>${product.fit}</dd></div>
    <div><dt>Fabric</dt><dd>${product.fabric}</dd></div>
    <div><dt>Details</dt><dd>${product.details}</dd></div>
    <div><dt>Sizes</dt><dd>${product.sizes.join(", ")}</dd></div>
  `;

  renderIcons();
}

function updateCart(key, action) {
  const item = cart.find((cartItem) => cartItem.key === key);
  if (!item) return;

  if (action === "increase") item.quantity += 1;
  if (action === "decrease") item.quantity -= 1;
  if (action === "remove" || item.quantity <= 0) {
    cart = cart.filter((cartItem) => cartItem.key !== key);
  }

  saveCart();
  renderCart();
}

function render() {
  renderFilters();
  renderProducts();
  renderCart();
}

els.categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  render();
});

els.sizeFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-size]");
  if (!button) return;
  state.size = button.dataset.size;
  render();
});

els.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderProducts();
});

els.priceRange.addEventListener("input", (event) => {
  state.maxPrice = Number(event.target.value);
  renderFilters();
  renderProducts();
});

els.sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

els.clearFilters.addEventListener("click", resetFilters);

els.productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.id);
  if (!product) return;

  if (button.dataset.action === "view") {
    openProduct(product.id);
  }

  if (button.dataset.action === "quick-add") {
    addToCart(product);
  }
});

els.cartButton.addEventListener("click", openCart);
els.closeCart.addEventListener("click", closeCart);
els.closeModal.addEventListener("click", closeModal);

els.overlay.addEventListener("click", () => {
  closeCart();
  closeModal();
});

els.cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart]");
  if (!button) return;
  updateCart(button.dataset.key, button.dataset.cart);
});

els.thumbnailRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-modal-image]");
  if (!button) return;
  state.modalImage = Number(button.dataset.modalImage);
  renderModal();
});

els.modalSizes.addEventListener("click", (event) => {
  const button = event.target.closest("[data-modal-size]");
  if (!button) return;
  state.modalSize = button.dataset.modalSize;
  renderModal();
});

els.modalColors.addEventListener("click", (event) => {
  const button = event.target.closest("[data-modal-color]");
  if (!button) return;
  state.modalColor = button.dataset.modalColor;
  renderModal();
});

els.modalAddToCart.addEventListener("click", () => {
  if (!state.modalProduct) return;
  addToCart(state.modalProduct, state.modalSize, state.modalColor);
});

els.themeButton.addEventListener("click", () => {
  document.body.classList.toggle("fresh-mode");
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    closeModal();
  }
});

render();
initFitModel();

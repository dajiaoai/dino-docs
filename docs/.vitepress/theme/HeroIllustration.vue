<template>
  <div class="geo-illus">
    <!--
      Geometry: triangle ABC inscribed in circumcircle.
      ViewBox 400×310, circle center O(200,180) r=130.
      A(200,50)  B(300,264)  C(100,264)
      Altitude feet: H_A(200,264)  H_B(136,187)  H_C(264,187)
      Orthocenter H(200,217)
    -->
    <svg
      viewBox="0 0 400 310"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="几何插图：三角形外接圆与三条高"
      role="img"
    >
      <!-- circumscribed circle -->
      <circle class="circ" cx="200" cy="180" r="130" />

      <!-- triangle fill -->
      <polygon class="tri-fill" points="200,50 300,264 100,264" />

      <!-- triangle edges -->
      <polygon class="tri-edge" points="200,50 300,264 100,264" />

      <!-- circumcenter radii (very faint) -->
      <line class="rad" x1="200" y1="180" x2="200" y2="50" />
      <line class="rad" x1="200" y1="180" x2="300" y2="264" />
      <line class="rad" x1="200" y1="180" x2="100" y2="264" />

      <!-- altitudes (dashed) -->
      <line class="alt" x1="200" y1="50" x2="200" y2="264" />
      <line class="alt" x1="300" y1="264" x2="136" y2="187" />
      <line class="alt" x1="100" y1="264" x2="264" y2="187" />

      <!-- right-angle mark at foot H_A (altitude ⊥ BC) -->
      <path class="ra" d="M200,256 L208,256 L208,264" />

      <!-- angle arc at vertex A -->
      <path class="arc-a" d="M208,68 A20,20 0 0,1 192,68" />

      <!-- altitude feet -->
      <circle class="pt-sm" cx="200" cy="264" r="3" />
      <circle class="pt-sm" cx="136" cy="187" r="3" />
      <circle class="pt-sm" cx="264" cy="187" r="3" />

      <!-- vertices A B C -->
      <circle class="pt-v" cx="200" cy="50" r="5" />
      <circle class="pt-v" cx="300" cy="264" r="5" />
      <circle class="pt-v" cx="100" cy="264" r="5" />

      <!-- circumcenter O (filled) -->
      <circle class="pt-o" cx="200" cy="180" r="4.5" />

      <!-- orthocenter H (ring) -->
      <circle class="pt-h" cx="200" cy="217" r="4.5" />

      <!-- labels -->
      <text class="lbl-v" x="207" y="46">A</text>
      <text class="lbl-v" x="308" y="271">B</text>
      <text class="lbl-v" x="74" y="271">C</text>
      <text class="lbl-c" x="207" y="178">O</text>
      <text class="lbl-h" x="207" y="220">H</text>
    </svg>
  </div>
</template>

<style scoped>
.geo-illus {
  width: 420px;
  height: 326px; /* 420 × 310/400 */
  animation: geo-fade-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes geo-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* circumscribed circle — traces in on load */
.circ {
  fill: none;
  stroke: #01b88b;
  stroke-width: 1.8;
  opacity: 0.55;
  stroke-dasharray: 817;
  stroke-dashoffset: 817;
  animation: circ-trace 1.4s cubic-bezier(0.4, 0, 0.2, 1) 0.15s both;
}

@keyframes circ-trace {
  to {
    stroke-dashoffset: 0;
  }
}

.tri-fill {
  fill: rgba(1, 184, 139, 0.05);
}

.tri-edge {
  fill: none;
  stroke: #a668b8;
  stroke-width: 2;
  stroke-linejoin: round;
}

.alt {
  stroke: #01b88b;
  stroke-width: 1.4;
  stroke-dasharray: 5 4;
  opacity: 0.72;
}

.ra {
  fill: none;
  stroke: #a668b8;
  stroke-width: 1.4;
  opacity: 0.85;
}

.rad {
  stroke: #01b88b;
  stroke-width: 1;
  opacity: 0.2;
}

.arc-a {
  fill: none;
  stroke: #a668b8;
  stroke-width: 1.4;
  opacity: 0.8;
}

.pt-sm {
  fill: #01b88b;
  opacity: 0.55;
}

.pt-v {
  fill: #a668b8;
}

.pt-o {
  fill: #01b88b;
}

.pt-h {
  fill: none;
  stroke: #01b88b;
  stroke-width: 2;
}

.lbl-v {
  font-size: 14px;
  font-style: italic;
  font-family: Georgia, 'Times New Roman', serif;
  fill: #a668b8;
}

.lbl-c,
.lbl-h {
  font-size: 12px;
  font-style: italic;
  font-family: Georgia, 'Times New Roman', serif;
  fill: #01b88b;
}

/* dark mode: slightly boost visibility */
:global(.dark) .circ {
  opacity: 0.7;
}
:global(.dark) .tri-fill {
  fill: rgba(1, 184, 139, 0.08);
}
:global(.dark) .alt {
  opacity: 0.85;
}
</style>

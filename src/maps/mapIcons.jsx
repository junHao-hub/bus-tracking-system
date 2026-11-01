import L from "leaflet";

// The emoji used on the map, the device draws them so they look familiar to everyone
const PICKUP_EMOJI = "📍";
const DESTINATION_EMOJI = "🏁";
const OTHER_STOP_EMOJI = "🚏";
const BUS_EMOJI = "🚌";

// Creates a map marker from an emoji.
// anchorX and anchorY say where the real position is inside the emoji,
// the tip of a pin is near the bottom, the bus is centered.
function emojiIcon(emoji, size, anchorX, anchorY) {
  return L.divIcon({
    className: "map-marker",
    html:
      `<div class="map-emoji" style="width:${size}px;height:${size}px;font-size:${Math.round(
        size * 0.85
      )}px">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size * anchorX, size * anchorY],
    popupAnchor: [0, -size * anchorY],
    tooltipAnchor: [0, -size * anchorY],
  });
}

// Pickup stop, destination stop and any other stop
export const pickupIcon = emojiIcon(PICKUP_EMOJI, 40, 0.5, 0.92);
export const destinationIcon = emojiIcon(DESTINATION_EMOJI, 40, 0.3, 0.92);
export const stopIcon = emojiIcon(OTHER_STOP_EMOJI, 34, 0.5, 0.92);

const BUS_ICON = emojiIcon(BUS_EMOJI, 44, 0.5, 0.5);

export function busIcon() {
  return BUS_ICON;
}
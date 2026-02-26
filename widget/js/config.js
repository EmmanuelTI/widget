// ===============================
// CONFIGURACIÓN GLOBAL DEL CHAT
// ===============================

const ROUTE_SEGMENT_MAP = [
    { path: "/pages/aspirantes.html", segment: "aspirantes" },
    { path: "/pages/padres.html", segment: "padres" },
  
];

function detectSegmentFromRoute() {
    const currentPath = window.location.pathname.toLowerCase();

    const match = ROUTE_SEGMENT_MAP.find(route =>
        currentPath === route.path.toLowerCase()
    );

    const segment = match ? match.segment : "aspirantes";

    return segment;
}

window.ChatConfig = {
    getSegment() {
        const   segment = detectSegmentFromRoute();
        return segment;
    }
};

import routes from "../../../assets/routes.json";

function addRouteV1(route, options, map) {
  fetch("/geo/route" + route + ".geojson")
    .then(response => response.json())
    .then(jsonResponse => {
      let layer = {
        id: "route" + route,
        type: "line",
        source: {
          type: "geojson",
          data: jsonResponse
        },
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": options.color,
          "line-width": 4
        }
      };
      map.on("load", () => map.addLayer(layer));
    });
}

export function init(map) {
  Object.entries(routes).forEach(([route, details]) => {
    addRouteV1(route, details, map);
  });
}

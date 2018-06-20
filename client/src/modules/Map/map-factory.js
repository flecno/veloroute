import mapboxgl, { Map } from "mapbox-gl";

export default function buildMap() {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiYnJldW5pZ3MiLCJhIjoiY2poeDIwOW14MDZsZTNxcHViajE0Y3Y5eCJ9._zBVNwelSOZOnRDEmwPGiA";

  return new Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v10",
    center: [10.0188, 53.5778],
    zoom: 11
  });
}

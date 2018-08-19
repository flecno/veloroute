import "../base.scss";

import { map, addRouteClickListener, addQualityClickListener, renderIndicator, toggleQuality, createMarker } from "./map";
import AbstractRoute from "./abstract_route";
import places from '../routes/geo/places.json';
import State from "./state";
import Swap from './swap';
import { addRouteChangeListener } from './state';

const state = new State(map);
const imagesPromise = import(/* webpackChunkName: "images" */ './images');
const abstractRoute = new AbstractRoute(imagesPromise, state, createMarker);

addRouteClickListener(state.routeSetter());
addRouteChangeListener(abstractRoute.showRoute, toggleQuality);

for(let el of document.querySelectorAll(".routing td a:not(.icon)")) {
  el.addEventListener('click', evt => {
    const placeName = evt.target.textContent;
    map.fitBounds(places[placeName], {maxZoom: 14.5});
  });
}

for(let el of document.querySelectorAll(".routing td a.icon")) {
  el.addEventListener('click', evt => {
    const routeName = evt.target.textContent;
    abstractRoute.showRoute(routeName);
  });
}

const infoLinks = document.querySelectorAll(".show-main-text");
for (let i = 0; i < infoLinks.length; i++) {
  infoLinks[i].addEventListener("click", state.routeResetter());
}
const qualityLinks = document.querySelectorAll(".show-quality");
for (let i = 0; i < qualityLinks.length; i++) {
  qualityLinks[i].addEventListener("click", () => {
    state.routeSetter()("quality");
  });
}

imagesPromise.then(({mlyViewer, addIndicatorListener, showCloseImage}) => {
  addIndicatorListener(renderIndicator, state.imageSetter());
  new Swap(map, mlyViewer);
  addRouteClickListener(showCloseImage);
  addQualityClickListener(showCloseImage);
});

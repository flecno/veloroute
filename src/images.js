import { ImageSize, Viewer } from 'mapillary-js';
import { readFromHash } from './state';
import { toQualityName } from './utils_web';
import filenames from '../routes/geo/content_hashed_filenames.json';

const API_KEY = 'MjFBX2pVMXN2aUlrSXFCVGlYMi11dzo4Yjk0NGY1MjMzYmExMzI2';
const slider = document.getElementById("slider");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const direction = document.getElementById("direction");
const playstop = document.getElementById("playstop");
const controls = document.getElementById("controls");

const GENERIC_START_IMAGE = 'c4B6txFX6Xgza8iWNFzSYw';

let status = {
  routeName: readFromHash().route,
  direction: "outward",
  branch: null,
  image:  readFromHash().image
}

let updateInProgress = false;
let updateInProgressResetter = null;
const markUpdateFinished = () => {
  updateInProgress = false;
  if(updateInProgressResetter) clearTimeout(updateInProgressResetter);
  updateInProgressResetter = null;
}
const markUpdateInProgress = () => {
  updateInProgress = true;
  updateInProgressResetter = setTimeout(markUpdateFinished, 10000);
}

let imageData = {};
const route = () => {
  if(!status.routeName) return Promise.resolve(null);
  const r = status.routeName.split("/")[0];
  if(imageData[r]) return imageData[r];

  const file = `images-${r}.json`;
  const url = `/routes/geo/${filenames[file]}`;
  // console.debug("Fetching images for", file, "from", url);

  imageData[r] = fetch(url)
    .then(response => response.json());

  return imageData[r];
}

const images = () => {
  return route()
    .then(r => {
      if(!r) return null;
      return r[`${status.direction}_${status.branch}`] || r[status.branch];
    })
}

let alertShown = false;
async function handleSliderMove(avoidListenerUpdates) {
  console.debug("Reacting to slider move. Current status: ", status);
  const pos = slider.value;

  const i = await images();
  if(!i) {
    console.debug("could not find images, disabling everything")
    controls.classList.add("disable-next", "disable-prev");
    prev.disabled = true;
    next.disabled = true;
    playstop.disabled = true;
    if(!alertShown) {
      alert("Bitte wähle zuerst eine Route aus, der gefolgt werden soll.")
      alertShown = true;
    }
    return;
  }

  const key = i.keys[pos];
  const loc = i.loc[pos];

  if(pos == 0) {
    controls.classList.add("disable-prev");
  } else {
    controls.classList.remove("disable-prev");
  }
  if(pos == i.keys.length-1) {
    controls.classList.add("disable-next");
  } else {
    controls.classList.remove("disable-next");
  }

  if(status.image === key) return;
  status.image = key;
  triggerImageUpdate();

  // The data here is the corrected "Structure From Motion" data, but it doesn't
  // take image-to-image transitions into account. Therefore, only update it
  // when immediate feedback is required, e.g. when the slider is being dragged.
  if(!avoidListenerUpdates) {
    indicatorListeners.forEach((f) => f(loc[0], loc[1], loc[2], key));
  }
}

async function setActiveRoute(routeName, branch, imgIndex) {
  if(!routeName || !branch) {
    console.debug("missing route info, disabling controls");
    status.routeName = null;
    status.branch = null;
    slider.setAttribute("max", 0);
    slider.value = 0;
    slider.disabled = true;
    handleSliderMove();
    controls.classList.add("hidden");
    return;
  }

  status.routeName = routeName;
  if(branch.indexOf("outward") === 0) {
    status.direction = "outward";
    status.branch = branch.replace("outward_", "");
  } else if (branch.indexOf("inward") === 0) {
    status.direction = "inward";
    status.branch = branch.replace("inward_", "");
  } else {
    status.branch = branch;
  }

  console.debug("Setting Active Route. Status: ", status);
  const img = await images();
  slider.disabled = false;
  slider.setAttribute("max", img.keys.length - 1);
  slider.value = imgIndex || 0;
  controls.classList.remove("hidden");
  handleSliderMove();
}

async function restoreBranch() {
  const rr = await route();
  if(!rr) return;
  if(!status.routeName.startsWith('quality') && !status.image) return;
  for(const branch in rr) {
    const imgKeys = rr[branch].keys;
    const idx = imgKeys.indexOf(status.image);
    if(idx >= 0) return setActiveRoute(status.routeName, branch, idx);
    const isShortcomingMarker = location.pathname.endsWith(toQualityName(branch));
    if(isShortcomingMarker) return setActiveRoute(status.routeName, branch);
  }
}
restoreBranch();

const viewer = new Viewer("mly", API_KEY, status.image, {
  component: {
    attribution: true,
    bearing: false,
    cache: {
      depth: {
        pano: 0,
        sequence: 2,
        step: 0,
        turn: 0
      }
    },
    cover: false,
    direction: false,
    keyboard: false,
    marker: false,
    sequence: false,
    zoom: false,
  }
});
viewer.deactivateComponent("cache");

let indicatorListeners = [];
const addIndicatorListener = (...funcs) => {
  funcs.forEach(f => indicatorListeners.push(f));
}

const distEuklid = (lng1, lat1, lng2, lat2) => Math.sqrt((lng1-lng2)**2 + (lat1-lat2)**2)

async function changeDirection(lngLat) {
  if(!lngLat) {
    const img = await images();
    const idx = img.keys.indexOf(status.image);
    const loc = img.loc[idx];
    lngLat = {lng: loc[0], lat: loc[1]};
  }
  showCloseImage(status.routeName, lngLat, "change-direction");
}

const stepSlider = (amount) => {
  slider.value = slider.value*1 + amount;
  handleSliderMove(true);
  viewer.activateComponent("cache");
}

let playTimeout = null;
const playShowNextImage = () => {
  if(!updateInProgress) stepSlider(+1);
  if(slider.disabled) return;
  playTimeout = setTimeout(playShowNextImage, 500);
}

const stopPlayback = () => {
  clearTimeout(playTimeout);
  // prevent Mapillary from showing the next image, in case it is currently
  // loading one
  viewer.moveToKey(status.image);
  playTimeout = null;
  playstop.textContent = '▶';
}

const handlePlayStop = () => {
  if(playTimeout != null) return stopPlayback();
  playstop.textContent = '■';
  playShowNextImage();
}

const handleEsc = (evt) => {
  evt = evt || window.event;
  let isEscape = "key" in evt && (evt.key == "Escape" || evt.key == "Esc");
  isEscape = isEscape || evt.keyCode == 27;
  if(isEscape) stopPlayback();
}

const cutOffDist = 0.0001;
const closestImageIndex = (images, lngLat) => {
  let distSoFar = Infinity;
  let candidateIdx = null;

  for(const idx in images.loc) {
    const img = images.loc[idx];
    const newDist = distEuklid(lngLat.lng, lngLat.lat, img[0], img[1]);
    if(newDist >= distSoFar) continue;
    distSoFar = newDist;
    candidateIdx = idx;
    if(distSoFar <= cutOffDist) break;
  }
  return { idx: candidateIdx, dist: distSoFar };
}

let prevLngLat = null;
async function showCloseImage(routeName, lngLat, eventSource) {
  stopPlayback();
  status.routeName = routeName;
  const ignoreCurrent = eventSource == "quality" || eventSource == "change-direction";

  if(prevLngLat && prevLngLat.lng === lngLat.lng && prevLngLat.lat === lngLat.lat && eventSource != "change-direction") {
    console.debug("Previous lngLat the same as current, attempting to switch direction instead.");
    return changeDirection(lngLat);
  }
  prevLngLat = lngLat;

  const current = `${status.direction}_${status.branch}`;
  let distances = {};

  if(ignoreCurrent) console.debug(`Ignoring images for direction ${status.direction}`);

  const rr = await route();
  for(const branch in rr) {
    if(ignoreCurrent && branch.startsWith(status.direction)) continue;
    distances[branch] = closestImageIndex(rr[branch], lngLat);
  }

  console.debug("Candidates for close images: ", distances)

  if(current in distances && distances[current].dist <= cutOffDist)
    return setActiveRoute(routeName, current, distances[current].idx);

  let closestBranch = null;
  let closestIdx = null;
  let distSoFar = Infinity;
  for(const branch in distances) {
    if(distances[branch].dist >= distSoFar) continue;
    closestBranch = branch;
    closestIdx = distances[branch].idx;
    distSoFar = distances[branch].dist;
  }

  return setActiveRoute(routeName, closestBranch, closestIdx);
}


const triggerImageUpdate = () => {
  if(!viewer.isNavigable) {
    // calling moveToKey while the cover component is still somehow active breaks
    // Mapillary. Instead, simply wait for the initial image to be done loading,
    // then move to the desired one. This is an edge case most of the time, since
    // we usually attach the desired image to the URL hash, so it will be known
    // ahead of time.
    console.log("Mapillary not yet loaded, simply waiting for first image to be done loading.");
    return;
  }

  if(updateInProgress) return;
  markUpdateInProgress();
  viewer.moveToKey(status.image);
}

const hasLoadedDesiredImage = (loadedImage, canTriggerLoad) => {
  // console.debug("Mapillary loaded node: ", loadedImage);
  // console.debug("Desired node:          ", status.image);

  if(loadedImage == status.image) {
    markUpdateFinished();
    return true;
  }

  if(canTriggerLoad) setTimeout(triggerImageUpdate, 0);
  return false;
}

let currentNode = null;
viewer.on(Viewer.nodechanged, function (node) {
  currentNode = node;
  if(hasLoadedDesiredImage(node.key, true)) {
    if(node.key === GENERIC_START_IMAGE) return;
    indicatorListeners.forEach((f) => f(node.latLon.lon, node.latLon.lat, node.ca, node.key));
  }
});
viewer.on(Viewer.bearingchanged, function (bearing) {
  if(currentNode.key === GENERIC_START_IMAGE) return;
  if(hasLoadedDesiredImage(currentNode.key, false)) {
    indicatorListeners.forEach((f) => f(currentNode.latLon.lon, currentNode.latLon.lat, bearing, currentNode.key));
  }
});
window.addEventListener("resize", () => viewer.resize());
next.addEventListener("click", () => { stopPlayback(); stepSlider(+1) });
prev.addEventListener("click", () => { stopPlayback(); stepSlider(-1) });
direction.addEventListener("click", () => changeDirection());
slider.addEventListener("input", () => handleSliderMove(false));
playstop.addEventListener("click", handlePlayStop);
document.addEventListener("keydown", handleEsc);


export { viewer as mlyViewer, addIndicatorListener, showCloseImage, setActiveRoute };

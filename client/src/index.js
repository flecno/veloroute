import "../assets/base.scss";
import Raster from "./modules/Raster";
import * as Routes from "./modules/Routes";
import buildMap from "./modules/Map";

const map = buildMap();
Raster(map);
Routes.init(map);

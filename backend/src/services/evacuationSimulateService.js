const { prisma } = require('../lib/prisma');
const { AppError } = require('../utils/AppError');
const evacuationCenterService = require('./evacuationCenterService');
const lineIntersect = require('@turf/line-intersect').default;
const { lineString } = require('@turf/helpers');

const WALKING_SPEED_KMH = 5;

function getRouteGeoJSON(fromLat, fromLng, toLat, toLng) {
  const coords = [
    [fromLng, fromLat],
    [toLng, toLat],
  ];
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: coords,
    },
  };
}

function getHazardPolygonsFromLayer(layer) {
  const geojson = layer.geojson;
  if (!geojson || typeof geojson !== 'object') return [];
  const features = geojson.features || (geojson.type === 'Feature' ? [geojson] : []);
  const polygons = [];
  for (const f of features) {
    const geom = f.geometry;
    if (!geom) continue;
    if (geom.type === 'Polygon' && geom.coordinates && geom.coordinates.length) {
      polygons.push({ type: 'Feature', geometry: geom, properties: { layerId: layer.id, name: layer.name, type: layer.type } });
    }
    if (geom.type === 'MultiPolygon' && geom.coordinates) {
      for (const ring of geom.coordinates) {
        polygons.push({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: ring },
          properties: { layerId: layer.id, name: layer.name, type: layer.type },
        });
      }
    }
  }
  return polygons;
}

function checkRouteIntersectsHazards(routeGeoJSON, hazardLayers) {
  const routeLine = lineString(routeGeoJSON.geometry.coordinates);
  const riskWarnings = [];
  for (const layer of hazardLayers) {
    const polygons = getHazardPolygonsFromLayer(layer);
    for (const poly of polygons) {
      try {
        const intersections = lineIntersect(routeLine, poly);
        if (intersections && intersections.features && intersections.features.length > 0) {
          riskWarnings.push({
            layerId: layer.id,
            layerName: layer.name || layer.type,
            type: layer.type,
            message: `Route intersects ${layer.type} hazard area`,
          });
        }
      } catch (_) {
        // skip invalid geometry
      }
    }
  }
  return riskWarnings;
}

async function simulate(userLat, userLng) {
  const lat = Number(userLat);
  const lng = Number(userLng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new AppError('Valid lat and lng are required', 400);
  }

  const centers = await prisma.evacuationCenter.findMany();
  if (centers.length === 0) {
    throw new AppError('No evacuation centers available', 404);
  }

  let nearest = centers[0];
  let minDist = evacuationCenterService.haversineKm(lat, lng, nearest.lat, nearest.lng);
  for (const c of centers.slice(1)) {
    const d = evacuationCenterService.haversineKm(lat, lng, c.lat, c.lng);
    if (d < minDist) {
      minDist = d;
      nearest = c;
    }
  }

  const distanceKm = Math.round(minDist * 1000) / 1000;
  const etaMinutes = Math.round((minDist / WALKING_SPEED_KMH) * 60);
  const route = getRouteGeoJSON(lat, lng, nearest.lat, nearest.lng);

  const hazardLayers = await prisma.riskLayer.findMany({
    where: { type: { in: ['FLOOD', 'LANDSLIDE'] } },
  });
  const riskWarnings = checkRouteIntersectsHazards(route, hazardLayers);

  return {
    evacuationCenter: {
      id: nearest.id,
      name: nearest.name,
      barangay: nearest.barangay,
      city: nearest.city,
      province: nearest.province,
      capacity: nearest.capacity,
      lat: nearest.lat,
      lng: nearest.lng,
    },
    route: route,
    distanceKm,
    etaMinutes,
    riskWarnings,
  };
}

module.exports = {
  simulate,
};

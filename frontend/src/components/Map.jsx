import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function Map({ sites = [], onPolygonCreated }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [88.0, 21.8],
      zoom: 7,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl(),
      "top-right"
    );

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });

    map.current.addControl(draw.current, "top-right");

    map.current.on("draw.create", (event) => {
      const feature = event.features?.[0];

      if (
        feature?.geometry?.type === "Polygon" &&
        feature.geometry.coordinates?.[0]?.length >= 4
      ) {
        onPolygonCreated?.(feature.geometry.coordinates[0]);
      }
    });

    map.current.on("draw.delete", () => {
      onPolygonCreated?.(null);
    });

    return () => {
      map.current?.remove();
      map.current = null;
      draw.current = null;
    };
  }, [onPolygonCreated]);

  // Display saved sites
  useEffect(() => {
    if (!map.current) return;

    const updateSites = () => {
      const features = sites
        .filter((site) => site.geometry)
        .map((site) => ({
          type: "Feature",
          properties: {
            id: site.id,
            name: site.name,
          },
          geometry: site.geometry,
        }));

      const geojson = {
        type: "FeatureCollection",
        features,
      };

      const source = map.current.getSource("sites");

      if (source) {
        source.setData(geojson);
        return;
      }

      map.current.addSource("sites", {
        type: "geojson",
        data: geojson,
      });

      map.current.addLayer({
        id: "site-fill",
        type: "fill",
        source: "sites",
        paint: {
          "fill-color": "#10b981",
          "fill-opacity": 0.25,
        },
      });

      map.current.addLayer({
        id: "site-outline",
        type: "line",
        source: "sites",
        paint: {
          "line-color": "#059669",
          "line-width": 3,
        },
      });
    };

    if (map.current.isStyleLoaded()) {
      updateSites();
    } else {
      map.current.once("load", updateSites);
    }
  }, [sites]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
    />
  );
}

export default Map;
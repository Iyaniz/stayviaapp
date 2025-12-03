import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface Marker {
  latitude: number;
  longitude: number;
  title?: string;
  color?: string;
  category?: string;
  icon?: string; // Ionicon name for custom icons
  isPrimary?: boolean; // Main location marker (property/user) - won't cluster
}

interface Circle {
  latitude: number;
  longitude: number;
  radius: number;
  color?: string;
}

interface OpenStreetMapProps {
  center: {
    latitude: number;
    longitude: number;
  };
  zoom?: number;
  markers?: Marker[];
  circles?: Circle[];
  onMapPress?: (latitude: number, longitude: number) => void;
  style?: any;
}

// Helper to get icon HTML with proper rendering
const getIconHTML = (iconName?: string, size: number = 18): string => {
  // Use simple text symbols that render consistently across platforms
  const iconMap: Record<string, string> = {
    // Education
    'school-outline': '🎓',
    'library-outline': '📚',

    // Transportation
    'bus-outline': '🚌',
    'train-outline': '🚆',
    'subway-outline': '🚇',
    'airplane-outline': '✈️',
    'car-outline': '🚗',

    // Shopping
    'cart-outline': '🛒',
    'storefront-outline': '🏪',
    'shirt-outline': '👕',
    'phone-portrait-outline': '📱',
    'book-outline': '📖',
    'bed-outline': '🛏️',
    'home-outline': '🏠',
    'hammer-outline': '🔨',
    'paw-outline': '🐾',
    'footsteps-outline': '👟',
    'water-outline': '💧',

    // Food & Dining
    'restaurant-outline': '🍽️',
    'cafe-outline': '☕',
    'pizza-outline': '🍕',
    'fast-food-outline': '🍔',
    'bicycle-outline': '🚴',
    'beer-outline': '🍺',

    // Health & Wellness
    'medical-outline': '⚕️',
    'medkit-outline': '💊',
    'fitness-outline': '💪',
    'flower-outline': '💐',

    // Finance
    'card-outline': '💳',
    'cash-outline': '💵',
    'calculator-outline': '🧮',
    'shield-outline': '🛡️',

    // Services
    'mail-outline': '✉️',
    'shield-checkmark-outline': '🚔',
    'flame-outline': '🔥',
    'business-outline': '🏢',
    'flag-outline': '🚩',
    'print-outline': '🖨️',
    'create-outline': '✏️',

    // Entertainment
    'film-outline': '🎬',
    'baseball-outline': '⚾',
    'happy-outline': '🎉',
    'fish-outline': '🐟',
    'color-palette-outline': '🎨',
    'musical-notes-outline': '🎵',
    'leaf-outline': '🍃',
    'trophy-outline': '🏆',
    'camera-outline': '📷',
    'bonfire-outline': '🔥',
    'people-outline': '👥',
    'globe-outline': '🌍',

    // Technology
    'wifi-outline': '📶',
    'laptop-outline': '💻',

    // Worship
    'heart-outline': '❤️',
    'moon-outline': '🌙',
    'star-outline': '⭐',

    // Utilities
    'construct-outline': '🔧',
    'car-sport-outline': '🏎️',
    'square-outline': '🅿️',
    'cube-outline': '📦',
    'brush-outline': '🖌️',
    'flash-outline': '⚡',
    'key-outline': '🔑',
    'cut-outline': '✂️',

    // Default
    'location-outline': '📍',
  };

  const icon = iconMap[iconName || 'location-outline'] || '📍';

  // Return HTML with proper rendering
  return `<div style="font-size: ${size}px; line-height: 1; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${icon}</div>`;
};

export default function OpenStreetMap({
  center,
  zoom = 15,
  markers = [],
  circles = [],
  onMapPress,
  style,
}: OpenStreetMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);

  // Update map when props change
  useEffect(() => {
    if (mapReady && webViewRef.current) {
      const escapedMarkers = markers.map((marker) => ({
        ...marker,
        title: marker.title ? marker.title.replace(/'/g, "\\'").replace(/"/g, '\\"') : '',
        iconHTML: getIconHTML(marker.icon, marker.isPrimary ? 20 : 16),
      }));

      // Separate primary markers from landmarks
      const primaryMarkers = escapedMarkers.filter((m) => m.isPrimary);
      const landmarkMarkers = escapedMarkers.filter((m) => !m.isPrimary);

      const updateScript = `
        (function() {
          try {
            // Clear existing markers and circles (but keep tile layer)
            map.eachLayer(function(layer) {
              if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.MarkerClusterGroup) {
                map.removeLayer(layer);
              }
            });

            // Update map center with smooth animation
            map.setView([${center.latitude}, ${center.longitude}], ${zoom}, {
              animate: true,
              duration: 0.5
            });

            // Add circles with modern styling
            ${circles
              .map(
                (circle) => `
              L.circle([${circle.latitude}, ${circle.longitude}], {
                color: '${circle.color || '#667EEA'}',
                fillColor: '${circle.color || '#667EEA'}',
                fillOpacity: 0.08,
                radius: ${circle.radius},
                weight: 2,
                opacity: 0.6,
                dashArray: '5, 10',
              }).addTo(map);
            `
              )
              .join('')}

            // Add PRIMARY markers (property/user location) - ALWAYS VISIBLE, NO CLUSTERING
            ${primaryMarkers
              .map(
                (marker, index) => `
              var primaryMarker${index} = L.marker([${marker.latitude}, ${marker.longitude}], {
                icon: L.divIcon({
                  className: 'primary-marker',
                  html: '<div style="position: relative; width: 50px; height: 60px; display: flex; align-items: center; justify-content: center;">' +
                    '<div style="position: absolute; width: 50px; height: 50px; background: linear-gradient(135deg, ${marker.color || '#667EEA'} 0%, ${marker.color ? marker.color + 'cc' : '#5568D3'} 100%); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 4px solid white; box-shadow: 0 8px 20px rgba(0,0,0,0.3), 0 4px 8px rgba(102,126,234,0.4); z-index: 1000;"></div>' +
                    '<div style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%) rotate(0deg); z-index: 1001;">' +
                    '${marker.iconHTML}' +
                    '</div>' +
                    '<div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 12px; height: 12px; background: rgba(0,0,0,0.2); border-radius: 50%; filter: blur(3px);"></div>' +
                    '</div>',
                  iconSize: [50, 60],
                  iconAnchor: [25, 55],
                  popupAnchor: [0, -55],
                }),
                zIndexOffset: 1000
              }).addTo(map);
              ${marker.title ? `primaryMarker${index}.bindPopup('<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 8px; min-width: 150px;"><strong style="color: #1a202c; font-size: 14px;">${marker.title}</strong><br/><span style="color: #718096; font-size: 12px;">📍 Primary Location</span></div>');` : ''}
            `
              )
              .join('')}

            // Create marker cluster group ONLY for landmarks
            var landmarkCluster = L.markerClusterGroup({
              maxClusterRadius: 60,
              spiderfyOnMaxZoom: true,
              showCoverageOnHover: false,
              zoomToBoundsOnClick: true,
              iconCreateFunction: function(cluster) {
                var count = cluster.getChildCount();
                return L.divIcon({
                  html: '<div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">' +
                    '<div style="width: 44px; height: 44px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(0,0,0,0.25), 0 2px 6px rgba(245,158,11,0.4);">' +
                    '<span style="color: white; font-weight: 700; font-size: 14px;">' + count + '</span>' +
                    '</div>' +
                    '<div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 14px; height: 14px; background: rgba(0,0,0,0.15); border-radius: 50%; filter: blur(4px);"></div>' +
                    '</div>',
                  className: 'landmark-cluster',
                  iconSize: [44, 44]
                });
              }
            });

            // Add LANDMARK markers to cluster (with custom icons)
            ${landmarkMarkers
              .map(
                (marker, index) => `
               var landmarkMarker${index} = L.marker([${marker.latitude}, ${marker.longitude}], {
                icon: L.divIcon({
                  className: 'landmark-marker',
                  html: '<div style="position: relative; width: 36px; height: 42px; display: flex; align-items: center; justify-content: center;">' +
                    '<div style="position: absolute; width: 36px; height: 36px; background: linear-gradient(135deg, ${marker.color || '#F59E0B'} 0%, ${marker.color ? marker.color + 'dd' : '#EA580C'} 100%); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></div>' +
                    '<div style="position: absolute; top: 4px; left: 50%; transform: translateX(-50%) rotate(0deg);">' +
                    '${marker.iconHTML}' +
                    '</div>' +
                    '<div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; background: rgba(0,0,0,0.15); border-radius: 50%; filter: blur(2px);"></div>' +
                    '</div>',
                  iconSize: [36, 42],
                  iconAnchor: [18, 38],
                  popupAnchor: [0, -38],
                })
              });
              ${marker.title ? `landmarkMarker${index}.bindPopup('<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 6px;"><strong style="color: #1a202c; font-size: 13px;">${marker.title}</strong></div>');` : ''}
              landmarkCluster.addLayer(landmarkMarker${index});
            `
              )
              .join('')}

            map.addLayer(landmarkCluster);
          } catch (error) {
            console.error('Map update error:', error);
          }
        })();
        true;
      `;
      webViewRef.current.injectJavaScript(updateScript);
    }
  }, [center, zoom, markers, circles, mapReady]);

  const generateInitialHTML = () => {
    const escapedMarkers = markers.map((marker) => ({
      ...marker,
      title: marker.title ? marker.title.replace(/'/g, "\\'").replace(/"/g, '\\"') : '',
      iconHTML: getIconHTML(marker.icon, marker.isPrimary ? 20 : 16),
    }));

    // Separate primary markers from landmarks
    const primaryMarkers = escapedMarkers.filter((m) => m.isPrimary);
    const landmarkMarkers = escapedMarkers.filter((m) => !m.isPrimary);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              overflow: hidden;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
            }
            #map {
              height: 100%;
              width: 100%;
              background: #f8fafc;
              touch-action: pan-x pan-y;
              -webkit-overflow-scrolling: touch;
            }
            .leaflet-container {
              touch-action: pan-x pan-y !important;
              -webkit-overflow-scrolling: touch;
            }
            .primary-marker, .landmark-marker, .landmark-cluster {
              background: transparent;
              border: none;
            }
            .primary-marker span, .landmark-marker span {
              font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            .leaflet-popup-content-wrapper {
              border-radius: 12px;
              box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            }
            .leaflet-popup-tip {
              border-radius: 2px;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            (function() {
              try {
                // Initialize map with modern styling
                var map = L.map('map', {
                  zoomControl: true,
                  scrollWheelZoom: true,
                  doubleClickZoom: false,
                  touchZoom: true,
                  dragging: true,
                  zoomAnimation: true,
                  fadeAnimation: true,
                  markerZoomAnimation: true,
                  tap: true,
                  tapTolerance: 15,
                }).setView([${center.latitude}, ${center.longitude}], ${zoom});
                
                // Prevent map container from propagating touch events to parent
                var mapContainer = map.getContainer();
                var mapPane = map.getPane('mapPane');
                var body = document.body;
                var html = document.documentElement;
                
                // Aggressive event prevention for Android WebView
                function preventParentScroll(e) {
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                  // On Android, also try to prevent default to stop page scroll
                  if (e.type === 'touchmove' && e.touches && e.touches.length === 1) {
                    // Single finger drag - prevent page scroll
                    e.preventDefault();
                  }
                }
                
                // Add listeners to map container with capture phase
                mapContainer.addEventListener('touchstart', preventParentScroll, { passive: false, capture: true });
                mapContainer.addEventListener('touchmove', preventParentScroll, { passive: false, capture: true });
                mapContainer.addEventListener('touchend', preventParentScroll, { passive: false, capture: true });
                mapContainer.addEventListener('touchcancel', preventParentScroll, { passive: false, capture: true });
                
                // Also prevent mouse events from scrolling
                mapContainer.addEventListener('mousedown', preventParentScroll, { passive: false, capture: true });
                mapContainer.addEventListener('mousemove', preventParentScroll, { passive: false, capture: true });
                
                // Prevent default touch behavior that might cause scrolling
                mapContainer.style.touchAction = 'pan-x pan-y';
                mapContainer.style.webkitTouchCallout = 'none';
                mapContainer.style.webkitUserSelect = 'none';
                mapContainer.style.userSelect = 'none';
                mapContainer.style.webkitOverflowScrolling = 'touch';
                
                // Also prevent events on the map pane
                if (mapPane) {
                  mapPane.addEventListener('touchstart', preventParentScroll, { passive: false, capture: true });
                  mapPane.addEventListener('touchmove', preventParentScroll, { passive: false, capture: true });
                  mapPane.addEventListener('touchend', preventParentScroll, { passive: false, capture: true });
                }
                
                // Prevent wheel events from scrolling parent when over map
                mapContainer.addEventListener('wheel', function(e) {
                  // Only prevent if it's a scroll wheel event, not zoom
                  if (e.ctrlKey || e.metaKey) {
                    // This is a pinch zoom, let it through
                    return;
                  }
                  e.stopPropagation();
                }, { passive: false, capture: true });
                
                // Also prevent events on body/html when touching map area
                function preventBodyScroll(e) {
                  // Check if touch originated from map
                  if (e.target && (mapContainer.contains(e.target) || mapContainer === e.target)) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    if (e.type === 'touchmove') {
                      e.preventDefault();
                    }
                  }
                }
                
                // Add listeners to body/html to catch any events that bubble up
                body.addEventListener('touchmove', preventBodyScroll, { passive: false, capture: true });
                html.addEventListener('touchmove', preventBodyScroll, { passive: false, capture: true });
                
                // Add CartoDB Positron tile layer (modern, clean design)
                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                  attribution: '© OpenStreetMap contributors, © CartoDB',
                  maxZoom: 19,
                  subdomains: 'abcd',
                }).addTo(map);

                // Add initial circles with modern styling
                ${circles
                  .map(
                    (circle) => `
                  L.circle([${circle.latitude}, ${circle.longitude}], {
                    color: '${circle.color || '#667EEA'}',
                    fillColor: '${circle.color || '#667EEA'}',
                    fillOpacity: 0.08,
                    radius: ${circle.radius},
                    weight: 2,
                    opacity: 0.6,
                    dashArray: '5, 10',
                  }).addTo(map);
                `
                  )
                  .join('')}

                // Add PRIMARY markers (property/user location) - ALWAYS VISIBLE
                ${primaryMarkers
                  .map(
                    (marker, index) => `
                  var primaryMarker${index} = L.marker([${marker.latitude}, ${marker.longitude}], {
                    icon: L.divIcon({
                      className: 'primary-marker',
                      html: '<div style="position: relative; width: 50px; height: 60px; display: flex; align-items: center; justify-content: center;">' +
                        '<div style="position: absolute; width: 50px; height: 50px; background: linear-gradient(135deg, ${marker.color || '#667EEA'} 0%, ${marker.color ? marker.color + 'cc' : '#5568D3'} 100%); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 4px solid white; box-shadow: 0 8px 20px rgba(0,0,0,0.3), 0 4px 8px rgba(102,126,234,0.4); z-index: 1000;"></div>' +
                        '<div style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%) rotate(0deg); z-index: 1001;">' +
                        '${marker.iconHTML}' +
                        '</div>' +
                        '<div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 12px; height: 12px; background: rgba(0,0,0,0.2); border-radius: 50%; filter: blur(3px);"></div>' +
                        '</div>',
                      iconSize: [50, 60],
                      iconAnchor: [25, 55],
                      popupAnchor: [0, -55],
                    }),
                    zIndexOffset: 1000
                  }).addTo(map);
                  ${marker.title ? `primaryMarker${index}.bindPopup('<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 8px; min-width: 150px;"><strong style="color: #1a202c; font-size: 14px;">${marker.title}</strong><br/><span style="color: #718096; font-size: 12px;">📍 Primary Location</span></div>');` : ''}
                `
                  )
                  .join('')}

                // Create marker cluster group ONLY for landmarks
                var landmarkCluster = L.markerClusterGroup({
                  maxClusterRadius: 60,
                  spiderfyOnMaxZoom: true,
                  showCoverageOnHover: false,
                  zoomToBoundsOnClick: true,
                  iconCreateFunction: function(cluster) {
                    var count = cluster.getChildCount();
                    return L.divIcon({
                      html: '<div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">' +
                        '<div style="width: 44px; height: 44px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(0,0,0,0.25), 0 2px 6px rgba(245,158,11,0.4);">' +
                        '<span style="color: white; font-weight: 700; font-size: 14px;">' + count + '</span>' +
                        '</div>' +
                        '<div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 14px; height: 14px; background: rgba(0,0,0,0.15); border-radius: 50%; filter: blur(4px);"></div>' +
                        '</div>',
                      className: 'landmark-cluster',
                      iconSize: [44, 44]
                    });
                  }
                });

                // Add LANDMARK markers to cluster (with custom icons)
                ${landmarkMarkers
                  .map(
                    (marker, index) => `
                  var landmarkMarker${index} = L.marker([${marker.latitude}, ${marker.longitude}], {
                    icon: L.divIcon({
                      className: 'landmark-marker',
                      html: '<div style="position: relative; width: 36px; height: 42px; display: flex; align-items: center; justify-content: center;">' +
                        '<div style="position: absolute; width: 36px; height: 36px; background: linear-gradient(135deg, ${marker.color || '#F59E0B'} 0%, ${marker.color ? marker.color + 'dd' : '#EA580C'} 100%); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></div>' +
                        '<div style="position: absolute; top: 4px; left: 50%; transform: translateX(-50%) rotate(0deg);">' +
                        '${marker.iconHTML}' +
                        '</div>' +
                        '<div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; background: rgba(0,0,0,0.15); border-radius: 50%; filter: blur(2px);"></div>' +
                        '</div>',
                      iconSize: [36, 42],
                      iconAnchor: [18, 38],
                      popupAnchor: [0, -38],
                    })
                  });
                  ${marker.title ? `landmarkMarker${index}.bindPopup('<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 6px;"><strong style="color: #1a202c; font-size: 13px;">${marker.title}</strong></div>');` : ''}
                  landmarkCluster.addLayer(landmarkMarker${index});
                `
                  )
                  .join('')}

                map.addLayer(landmarkCluster);

                // Handle map clicks - disable clustering interference
                map.on('click', function(e) {
                  // Only trigger if click is on the map, not on markers
                  if (e.originalEvent && e.originalEvent.target && 
                      e.originalEvent.target.tagName !== 'IMG' && 
                      !e.originalEvent.target.closest('.leaflet-marker-icon')) {
                    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'mapPress',
                      latitude: e.latlng.lat,
                      longitude: e.latlng.lng
                    }));
                  }
                });

                // Notify React Native that map is ready
                setTimeout(function() {
                  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'mapReady'
                  }));
                }, 500);
              } catch (error) {
                console.error('Map initialization error:', error);
              }
            })();
          </script>
        </body>
      </html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady') {
        setMapReady(true);
      } else if (data.type === 'mapPress' && onMapPress) {
        onMapPress(data.latitude, data.longitude);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View 
      style={[styles.container, style]}
      onStartShouldSetResponder={() => false}
      onMoveShouldSetResponder={(evt, gestureState) => {
        // Only capture move events (drags) on Android to prevent parent scroll
        // Initial touch passes through to WebView
        if (Platform.OS === 'android') {
          return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
        }
        return false;
      }}
      onResponderGrant={() => {
        // We've captured the drag - prevent parent scroll but let WebView handle it
      }}
      onResponderMove={() => {
        // Movement captured - WebView should still receive events through its own system
      }}
      onResponderRelease={() => {}}
      onResponderTerminationRequest={() => false}
      collapsable={false}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: generateInitialHTML() }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667EEA" />
          </View>
        )}
        style={styles.webView}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
        }}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        overScrollMode="never"
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        androidHardwareAccelerationDisabled={false}
        androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
        injectedJavaScript={`
          (function() {
            // Aggressive event prevention for Android
            function preventParentScroll(e) {
              e.stopPropagation();
              e.stopImmediatePropagation();
              if (e.type === 'touchmove' && e.touches && e.touches.length === 1) {
                e.preventDefault();
              }
            }
            
            // Wait for map to be ready, then add listeners
            setTimeout(function() {
              var mapContainer = document.getElementById('map');
              if (mapContainer) {
                mapContainer.addEventListener('touchstart', preventParentScroll, { passive: false, capture: true });
                mapContainer.addEventListener('touchmove', preventParentScroll, { passive: false, capture: true });
                mapContainer.addEventListener('touchend', preventParentScroll, { passive: false, capture: true });
                mapContainer.style.touchAction = 'pan-x pan-y';
                
                // Also prevent on body
                document.body.addEventListener('touchmove', function(e) {
                  if (mapContainer.contains(e.target) || mapContainer === e.target) {
                    e.stopPropagation();
                    e.preventDefault();
                  }
                }, { passive: false, capture: true });
              }
            }, 1000);
          })();
          true;
        `}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});

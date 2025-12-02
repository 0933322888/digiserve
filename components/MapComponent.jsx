'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Map Component using Leaflet.js with OpenStreetMap tiles
 * Completely free - no API key required
 *
 * @param {string} address - Full address string
 * @param {Object} coordinates - Optional: { lat: number, lon: number } to skip geocoding
 */
export default function MapComponent({ address, coordinates: providedCoordinates }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const tileLayerRef = useRef(null)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Detect dark mode function
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        // Check localStorage first, then class, then system preference
        const savedTheme = localStorage.getItem('theme')
        const hasDarkClass = document.documentElement.classList.contains('dark')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        
        const isDark = savedTheme === 'dark' || 
          (savedTheme !== 'light' && (hasDarkClass || prefersDark))
        
        setIsDarkMode(isDark)
        return isDark
      }
      return false
    }
    
    // Initial check
    checkDarkMode()
    
    // Watch for dark mode changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      // Watch for class changes on html element
      const observer = new MutationObserver(() => {
        checkDarkMode()
      })
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      })
      
      // Watch for system preference changes
      const handleMediaChange = () => {
        checkDarkMode()
      }
      mediaQuery.addEventListener('change', handleMediaChange)
      
      // Watch for localStorage changes (when theme is toggled)
      const handleStorageChange = (e) => {
        if (e.key === 'theme') {
          checkDarkMode()
        }
      }
      window.addEventListener('storage', handleStorageChange)
      
      // Also listen for custom event that might be dispatched when theme changes
      const handleThemeChange = () => {
        checkDarkMode()
      }
      window.addEventListener('themechange', handleThemeChange)
      
      return () => {
        observer.disconnect()
        mediaQuery.removeEventListener('change', handleMediaChange)
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('themechange', handleThemeChange)
      }
    }
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current) return
    
    // Wait a tick to ensure dark mode state is set
    const initTimeout = setTimeout(() => {
      if (!mapRef.current) return

    // Create custom marker icon with restaurant branding
    const createCustomIcon = () => {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #8B0000 0%, #A52A2A 100%);
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid #D4AF37;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            <div style="
              transform: rotate(45deg);
              color: #D4AF37;
              font-size: 20px;
              font-weight: bold;
              line-height: 1;
            ">📍</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      })
    }

    // Geocode address to coordinates (using Nominatim - free OpenStreetMap geocoding)
    const geocodeAddress = async addr => {
      try {
        // Try multiple address formats for better geocoding results
        const addressVariations = [
          addr, // Full address as provided
          `${addr}, Canada`, // Add country
          addr.replace(/,/g, ' '), // Remove commas
        ]

        for (const addressQuery of addressVariations) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'TRIO BISTRO Website', // Required by Nominatim
                  'Accept-Language': 'en',
                },
              }
            )

            if (!response.ok) {
              console.warn(`Geocoding request failed: ${response.status}`)
              continue
            }

            const data = await response.json()
            if (data && data.length > 0) {
              const result = data[0]
              console.log('Geocoding success:', {
                address: addressQuery,
                coordinates: { lat: result.lat, lon: result.lon },
                display_name: result.display_name,
              })
              return {
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
              }
            }
          } catch (error) {
            console.warn('Geocoding attempt failed:', error)
            continue
          }
        }
      } catch (error) {
        console.error('Geocoding error:', error)
      }

      // Default coordinates for 307D Richmond Road, Ottawa (approximate)
      // If geocoding fails, use these known coordinates
      console.warn('Geocoding failed, using default coordinates')
      return { lat: 45.3844, lon: -75.7587 }
    }

    const initMap = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Use provided coordinates if available, otherwise geocode
        let coordinates = providedCoordinates
        if (!coordinates || !coordinates.lat || !coordinates.lon) {
          coordinates = await geocodeAddress(address)
        }

        // Initialize map if not already initialized
        if (!mapInstanceRef.current && mapRef.current) {
          // Ensure map container has dimensions
          if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
            console.warn('Map container has no dimensions, retrying...')
            setTimeout(() => initMap(), 100)
            return
          }

          const map = L.map(mapRef.current, {
            zoomControl: false, // We'll add custom positioned controls
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            dragging: true,
            touchZoom: true,
            zoomAnimation: true,
            fadeAnimation: true,
            markerZoomAnimation: true,
          }).setView([coordinates.lat, coordinates.lon], 17)

          // Add zoom control in top-right
          L.control.zoom({
            position: 'topright',
          }).addTo(map)

          // Use CartoDB Positron tiles - clean, modern, professional look
          // Falls back to OpenStreetMap if CartoDB is unavailable
          const cartoPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20,
            minZoom: 10,
          })

          const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20,
            minZoom: 10,
          })

          // Fallback to OpenStreetMap
          const osmTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
            maxZoom: 19,
            minZoom: 10,
          })

          // Add tile layer based on dark mode preference
          const selectedTileLayer = isDarkMode ? cartoDark : cartoPositron
          
          // Try to add CartoDB tiles, fallback to OSM if it fails
          selectedTileLayer.addTo(map)
          tileLayerRef.current = selectedTileLayer

          // If CartoDB fails to load, switch to OSM after a timeout
          setTimeout(() => {
            if (map.hasLayer(selectedTileLayer)) {
              // Check if tiles are actually loading
              const testImg = new Image()
              testImg.onerror = () => {
                // CartoDB failed, switch to OSM
                map.removeLayer(selectedTileLayer)
                osmTiles.addTo(map)
                tileLayerRef.current = osmTiles
              }
              testImg.src = selectedTileLayer.getTileUrl({ x: 0, y: 0, z: 1 })
            }
          }, 2000)

          // Add custom marker
          const customIcon = createCustomIcon()
          const marker = L.marker([coordinates.lat, coordinates.lon], {
            icon: customIcon,
          }).addTo(map)

          // Create styled popup
          const popupContent = `
            <div style="
              padding: 8px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
              <div style="
                font-weight: bold;
                font-size: 16px;
                color: #8B0000;
                margin-bottom: 6px;
                border-bottom: 2px solid #D4AF37;
                padding-bottom: 4px;
              ">TRIO BISTRO & LOUNGE</div>
              <div style="
                font-size: 13px;
                color: #333;
                line-height: 1.5;
              ">${address}</div>
            </div>
          `
          marker.bindPopup(popupContent, {
            className: 'custom-popup',
            maxWidth: 250,
            closeButton: true,
            autoPan: true,
          }).openPopup()


          mapInstanceRef.current = map
          markerRef.current = marker

          // Smooth zoom animation
          setTimeout(() => {
            map.setZoom(17, { animate: true })
          }, 300)
        } else if (mapInstanceRef.current && markerRef.current) {
          // Update marker position if map already exists
          mapInstanceRef.current.setView([coordinates.lat, coordinates.lon], 17, {
            animate: true,
            duration: 0.5,
          })
          markerRef.current.setLatLng([coordinates.lat, coordinates.lon])
          const popupContent = `
            <div style="padding: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="font-weight: bold; font-size: 16px; color: #8B0000; margin-bottom: 6px; border-bottom: 2px solid #D4AF37; padding-bottom: 4px;">TRIO BISTRO & LOUNGE</div>
              <div style="font-size: 13px; color: #333; line-height: 1.5;">${address}</div>
            </div>
          `
          markerRef.current.setPopupContent(popupContent)

        }

        setIsLoading(false)
      } catch (error) {
        console.error('Map initialization error:', error)
        setError('Failed to load map. Please try refreshing the page.')
        setIsLoading(false)
      }
    }

      initMap().catch(error => {
        console.error('Map initialization error:', error)
      })
    }, 0)

    // Cleanup
    return () => {
      clearTimeout(initTimeout)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [address, isClient, providedCoordinates, isDarkMode])

  // Separate effect to update tile layer when dark mode changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return

    const cartoPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
      minZoom: 10,
    })

    const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
      minZoom: 10,
    })

    const newTileLayer = isDarkMode ? cartoDark : cartoPositron
    const currentUrl = tileLayerRef.current._url || ''
    
    // Only switch if the tile layer type has changed
    const isCurrentlyDark = currentUrl.includes('dark_all')
    if (isDarkMode !== isCurrentlyDark) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current)
      newTileLayer.addTo(mapInstanceRef.current)
      tileLayerRef.current = newTileLayer
    }
  }, [isDarkMode])

  if (!isClient) {
    return (
      <div className="w-full h-full rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary dark:border-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-300 dark:border-gray-600">
        <div className="text-center p-4">
          <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setIsLoading(true)
              if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
                markerRef.current = null
                circleRef.current = null
              }
            }}
            className="text-sm text-primary dark:text-gold hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-[1000] rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary dark:border-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </div>
      )}
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
        }
        .leaflet-control-zoom a {
          background-color: white !important;
          color: #8B0000 !important;
          border: 1px solid #ddd !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #f5f5f5 !important;
          color: #A52A2A !important;
        }
        .leaflet-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .leaflet-attribution {
          background: rgba(255, 255, 255, 0.9) !important;
          border-radius: 4px !important;
          padding: 2px 6px !important;
          font-size: 11px !important;
        }
      `}</style>
    </div>
  )
}

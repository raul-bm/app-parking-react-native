import { Map, Camera, Marker } from '@maplibre/maplibre-react-native';
import { View } from 'react-native';
export default function MapPreview({ lat, long }: { lat: number; long: number }) {
  return (
    <View className="h-24 w-24 overflow-hidden rounded-xl border border-gray-600">
      <Map
        style={{ flex: 1 }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        dragPan={false}
        touchZoom={false}
        touchRotate={false}
        touchPitch={false}
        doubleTapZoom={false}
        pointerEvents="none">
        <Camera center={[long, lat]} zoom={14} />
        <Marker lngLat={[long, lat]}>
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: 'red',
              borderWidth: 2,
              borderColor: 'white',
            }}
          />
        </Marker>
      </Map>
    </View>
  );
}

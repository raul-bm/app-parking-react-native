import { View, Text, Pressable, TextInput } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Map, Camera, Marker, GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { usePins } from '@/context/PinsContext';
import { useTranslation } from 'react-i18next';
import { getTimeAgoParts } from '@/utils/formatDate';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { PinDetailSheet } from '@/components/PinDetailSheet';
import { RFValue } from 'react-native-responsive-fontsize';

export default function MapPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [clickedLocation, setClickedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [note, setNote] = useState('');
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [region, setRegion] = useState({
    latitude: 40.4168,
    longitude: -3.7038,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const isZoomedOut = region.latitudeDelta > 0.05;
  const isUserVisible =
    userLocation &&
    Math.abs(userLocation.latitude - region.latitude) < region.latitudeDelta / 2 &&
    Math.abs(userLocation.longitude - region.longitude) < region.longitudeDelta / 2;
  const showLocate = !isUserVisible || isZoomedOut;
  const { pins, refresh, addPin } = usePins();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const cameraRef = useRef<any>(null);

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  }

  useEffect(() => {
    requestLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const lastPin = pins.length ? [...pins].sort((a: any, b: any) => b.id - a.id)[0] : null;

  useEffect(() => {
    if (lastPin)
      cameraRef.current?.easeTo({
        center: [Number(lastPin.long), Number(lastPin.lat)],
        zoom: 14,
        duration: 500,
      });
  }, [lastPin]);

  useEffect(() => {
    if (selectedPin && !pins.find((p: any) => String(p.id) === String(selectedPin.id))) {
      setSelectedPin(null);
    }
  }, [pins]);

  async function createPin(lat: number, long: number) {
    await addPin(lat, long, note || undefined);
    setNote('');
    setClickedLocation(null);
  }

  function formatAgo(date: string) {
    const { days, hours, minutes, now } = getTimeAgoParts(date);
    if (now) return t('timeAgo.now');

    const parts: string[] = [];

    if (days) parts.push(t(days === 1 ? 'timeAgo.day' : 'timeAgo.days', { count: days }));
    if (hours) parts.push(t(hours === 1 ? 'timeAgo.hour' : 'timeAgo.hours', { count: hours }));
    if (minutes) parts.push(t('timeAgo.min', { count: minutes }));

    if (parts.length === 1) return `${t('timeAgo.ago')} ${parts[0]}`;
    if (parts.length === 2) return `${t('timeAgo.ago')} ${parts[0]}, ${parts[1]}`;
    return `${t('timeAgo.ago')} ${parts[0]}, ${parts[1]}, ${parts[2]}`;
  }

  return (
    <View className="flex-1 bg-gray-900">
      <View className="mt-6 flex-1 p-6">
        <View className="flex-1 overflow-hidden rounded-2xl border border-gray-700">
          {userLocation ? (
            <Map
              key={`map-${pins.length}-${lastPin?.id ?? 0}-${pins.map((p: any) => p.id).join('-')}`}
              style={{ flex: 1 }}
              mapStyle="https://tiles.openfreemap.org/styles/liberty"
              attribution={false}
              logo={false}
              scaleBar={false}
              onPress={(e: any) => {
                const c = e.nativeEvent?.lngLat ?? e.lngLat;
                setClickedLocation({ latitude: c[1], longitude: c[0] });
              }}
              onRegionDidChange={(e: any) => {
                const c = e.nativeEvent?.center ?? e.center;
                if (c)
                  setRegion({
                    latitude: c[1],
                    longitude: c[0],
                    latitudeDelta: 0.01 * Math.pow(2, 14 - (e.nativeEvent?.zoom ?? 14)),
                    longitudeDelta: 0.01,
                  });
              }}>
              <Camera
                ref={cameraRef}
                center={
                  lastPin
                    ? [Number(lastPin.long), Number(lastPin.lat)]
                    : [userLocation.longitude, userLocation.latitude]
                }
                zoom={14}
              />
              <GeoJSONSource
                id="user"
                data={{
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [userLocation.longitude, userLocation.latitude],
                  },
                  properties: {},
                }}>
                <Layer
                  type="circle"
                  id="userCircle"
                  paint={{
                    'circle-radius': 8,
                    'circle-color': 'rgba(168,85,247,0.6)',
                    'circle-stroke-color': '#7c3aed',
                    'circle-stroke-width': 2,
                  }}
                />
              </GeoJSONSource>
              {clickedLocation && (
                <GeoJSONSource
                  id="clicked"
                  data={{
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [clickedLocation.longitude, clickedLocation.latitude],
                    },
                    properties: {},
                  }}>
                  <Layer
                    type="circle"
                    id="clickedCircle"
                    paint={{
                      'circle-radius': 6,
                      'circle-color': 'rgba(16,185,129,0.4)',
                      'circle-stroke-color': '#059669',
                      'circle-stroke-width': 2,
                    }}
                  />
                </GeoJSONSource>
              )}
              {pins.map((p: any) => (
                <Marker
                  key={String(p.id)}
                  id={String(p.id)}
                  lngLat={[Number(p.long), Number(p.lat)]}
                  onPress={() => {
                    if (selectedPin?.id === p.id) bottomSheetRef.current?.expand();
                    else setSelectedPin(p);
                  }}>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: String(p.id) === String(lastPin?.id) ? 'red' : 'orange',
                      borderWidth: 2,
                      borderColor: 'white',
                    }}
                  />
                </Marker>
              ))}
            </Map>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400" style={{ fontSize: RFValue(9) }}>
                {t('mapPage.mapGettingLocation')}
              </Text>
            </View>
          )}
        </View>
        {selectedPin && (
          <View
            style={{
              position: 'absolute',
              top: 12,
              alignSelf: 'center',
              backgroundColor: 'white',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
              minWidth: 180,
              alignItems: 'center',
            }}>
            <Text style={{ fontSize: RFValue(12), fontWeight: '700' }}>
              {formatAgo(selectedPin.createdAt)}
            </Text>
          </View>
        )}
        {showLocate && (
          <Pressable
            onPress={() =>
              cameraRef.current?.easeTo({
                center: [userLocation!.longitude, userLocation!.latitude],
                zoom: 14,
                duration: 500,
              })
            }
            className="absolute left-8 top-8 rounded-full bg-black p-2 shadow">
            <Ionicons name="locate" size={22} color="white" />
          </Pressable>
        )}
      </View>
      <View className="px-4 pb-2">
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder={t('mapPage.notePlaceholder')}
          placeholderTextColor="#6b7280"
          className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3 text-white"
          style={{ fontSize: RFValue(10) }}
        />
      </View>
      <View className="gap-2 px-4 pb-4">
        {clickedLocation && (
          <Pressable
            onPress={() => createPin(clickedLocation.latitude, clickedLocation.longitude)}
            className="rounded-2xl bg-emerald-600 py-4">
            <Text className="text-center font-bold text-white" style={{ fontSize: RFValue(10) }}>
              {t('mapPage.parkSelectedPoint')}
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => userLocation && createPin(userLocation.latitude, userLocation.longitude)}
          disabled={!userLocation}
          className="rounded-2xl bg-purple-600 py-4 disabled:opacity-40">
          <Text className="text-center font-bold text-white" style={{ fontSize: RFValue(10) }}>
            {t('mapPage.parkOnLocation')}
          </Text>
        </Pressable>
      </View>
      <PinDetailSheet
        pin={selectedPin}
        onClose={() => setSelectedPin(null)}
        bottomSheetRef={bottomSheetRef}
      />
    </View>
  );
}

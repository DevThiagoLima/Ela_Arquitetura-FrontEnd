import { useMemo } from 'react';
import { PixelRatio, useWindowDimensions } from 'react-native';

/** Largura de referência do design: iPhone 17 Pro (402pt). */
const BASE_WIDTH = 402;

/** Acima dessa largura (iPad, rotação) a escala para de crescer. */
const MAX_WIDTH = 480;

export type Scale = (size: number) => number;

/**
 * Retorna `s`, que escala uma medida do design proporcionalmente
 * à largura real da tela. Ex.: s(16) = 16 no iPhone 17 Pro.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const factor = Math.min(width, MAX_WIDTH) / BASE_WIDTH;
    const s: Scale = (size) => PixelRatio.roundToNearestPixel(size * factor);
    return { width, height, s };
  }, [width, height]);
}
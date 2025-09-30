import { BoxDesign } from './types';

export const boxDesigns: BoxDesign[] = [
  {
    id: 'AV3-1',
    name: 'AgeVisor 3',
    dimensions: { width: 6, height: 9.5, depth: 9.5 },
    faces: {
      front: '/packaging/av3-1/av3-1_front.png',
      back: '/packaging/av3-1/av3-1_back.png',
      left: '/packaging/av3-1/av3-1_left.png',
      right: '/packaging/av3-1/av3-1_right.png',
      top: '/packaging/av3-1/av3-1_top.png',
      bottom: '/packaging/av3-1/av3-1_bottom.png'
    }
  },
];

export const getBoxDesignById = (id: string): BoxDesign | undefined => {
  return boxDesigns.find(design => design.id === id);
};

export const getDefaultBoxDesign = (): BoxDesign => {
  return boxDesigns[0];
};
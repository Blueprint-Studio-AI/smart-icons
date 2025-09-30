export interface BoxDesign {
  id: string;
  name: string;
  dimensions: { 
    width: number; 
    height: number; 
    depth: number; 
  };
  faces: {
    front: string;    // image path
    back: string;
    left: string;
    right: string;
    top: string;
    bottom: string;
  };
}
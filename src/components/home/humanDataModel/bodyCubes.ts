/** Large equal squares — L/R symmetric, full body cover. */
export const COLS = 5;
export const ROWS = 11;
export const RADIUS = 18;

export interface BodyCube {
  c: number;
  r: number;
  left: number;
  top: number;
  sizeW: number;
  sizeH: number;
}

export const BODY_CUBES: BodyCube[] = [
  { c: 2, r: 0, left: 41.342, top: 1.885, sizeW: 17.425, sizeH: 7.981 },
  { c: 2, r: 1, left: 41.342, top: 10.655, sizeW: 17.425, sizeH: 7.981 },
  { c: 1, r: 2, left: 22.194, top: 19.425, sizeW: 17.425, sizeH: 7.981 },
  { c: 2, r: 2, left: 41.342, top: 19.425, sizeW: 17.425, sizeH: 7.981 },
  { c: 3, r: 2, left: 60.491, top: 19.425, sizeW: 17.425, sizeH: 7.981 },
  { c: 1, r: 3, left: 22.194, top: 28.195, sizeW: 17.425, sizeH: 7.981 },
  { c: 2, r: 3, left: 41.342, top: 28.195, sizeW: 17.425, sizeH: 7.981 },
  { c: 3, r: 3, left: 60.491, top: 28.195, sizeW: 17.425, sizeH: 7.981 },
  { c: 0, r: 4, left: 3.045, top: 36.965, sizeW: 17.425, sizeH: 7.981 },
  { c: 1, r: 4, left: 22.194, top: 36.965, sizeW: 17.425, sizeH: 7.981 },
  { c: 2, r: 4, left: 41.342, top: 36.965, sizeW: 17.425, sizeH: 7.981 },
  { c: 3, r: 4, left: 60.491, top: 36.965, sizeW: 17.425, sizeH: 7.981 },
  { c: 4, r: 4, left: 79.639, top: 36.965, sizeW: 17.425, sizeH: 7.981 },
  { c: 0, r: 5, left: 3.045, top: 45.735, sizeW: 17.425, sizeH: 7.981 },
  { c: 1, r: 5, left: 22.194, top: 45.735, sizeW: 17.425, sizeH: 7.981 },
  { c: 2, r: 5, left: 41.342, top: 45.735, sizeW: 17.425, sizeH: 7.981 },
  { c: 3, r: 5, left: 60.491, top: 45.735, sizeW: 17.425, sizeH: 7.981 },
  { c: 4, r: 5, left: 79.639, top: 45.735, sizeW: 17.425, sizeH: 7.981 },
  { c: 1, r: 6, left: 22.194, top: 54.505, sizeW: 17.425, sizeH: 7.981 },
  { c: 2, r: 6, left: 41.342, top: 54.505, sizeW: 17.425, sizeH: 7.981 },
  { c: 3, r: 6, left: 60.491, top: 54.505, sizeW: 17.425, sizeH: 7.981 },
  { c: 1, r: 7, left: 22.194, top: 63.275, sizeW: 17.425, sizeH: 7.981 },
  { c: 2, r: 7, left: 41.342, top: 63.275, sizeW: 17.425, sizeH: 7.981 },
  { c: 3, r: 7, left: 60.491, top: 63.275, sizeW: 17.425, sizeH: 7.981 },
  { c: 1, r: 8, left: 22.194, top: 72.045, sizeW: 17.425, sizeH: 7.981 },
  { c: 2, r: 8, left: 41.342, top: 72.045, sizeW: 17.425, sizeH: 7.981 },
  { c: 3, r: 8, left: 60.491, top: 72.045, sizeW: 17.425, sizeH: 7.981 },
  { c: 1, r: 9, left: 22.194, top: 80.815, sizeW: 17.425, sizeH: 7.981 },
  { c: 3, r: 9, left: 60.491, top: 80.815, sizeW: 17.425, sizeH: 7.981 },
  { c: 1, r: 10, left: 22.194, top: 89.585, sizeW: 17.425, sizeH: 7.981 },
  { c: 3, r: 10, left: 60.491, top: 89.585, sizeW: 17.425, sizeH: 7.981 },
];
